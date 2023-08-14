/*
  model.js

  //Author: Ryan Benac
  //USACE MVR ECG

  Note: See config/references.txt for reference and documentation links

  This file is required. It must export a class with at least one public function called `getData`
 */
//const request = require('request').defaults({ json: true })
const fetch = import('node-fetch') // requesting from API
const config = require('config')
const _ = require('lodash') // dealing with arrays and numbers
const crossFetch = require('cross-fetch') // fetch function fix for node js
const {writeFile, readFile} = require("fs")

// throw error if required configuration definition variables not defined
if (!config.ogcconnector.sand_instanceID) throw new Error(`CONFIG ERROR: Instance ID must be defined in the config.`)
if (!config.ogcconnector.keynetixCloud) throw new Error(`CONFIG ERROR: Keynetix Cloud Instance must be defined in the config.`)
if (!config.ogcconnector.contentType) throw new Error(`CONFIG ERROR: Content type must be defined in the config.`)
if (!config.ogcconnector.token) throw new Error(`CONFIG ERROR: Token must be defined in the config.`)
if (!config.ogcconnector.url) throw new Error(`CONFIG ERROR: API access URL must be defined in the config.`)
if (!config.ogcconnector.client_secret) throw new Error(`CONFIG ERROR: Client secret (service account) must be defined in the config.`)
if (!config.ogcconnector.client_id) throw new Error(`CONFIG ERROR: Client ID (service account) must be defined in the config.`)
if (!config.ogcconnector.scope) throw new Error(`CONFIG ERROR: Scope (service account) must be defined in the config.`)
if (!config.ogcconnector.grant_type) throw new Error(`CONFIG ERROR: Credential grant type (service account) must be defined in the config.`)
if (!config.ogcconnector.request_url) throw new Error(`CONFIG ERROR: Token request URLmust be defined in the config.`)

// pull initial config data
const instanceID = config.ogcconnector.sand_instanceID
const keynetixCloud = config.ogcconnector.keynetixCloud
const contentType = config.ogcconnector.contentType
const url = config.ogcconnector.url

function opengroundcloud (koop) {}

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// Config parameters (config/default.json)
// req.

opengroundcloud.prototype.getData = function getData (req, callback) {
  // get the host and id
  const { host, id } = req.params

  //url "id" paramenter must be in the form projectID::modelName
  const details = req.params.id.split('::')
  const projectID = details[0]
  const modelName = details[1]

  // throw error if id in the wrong format
  if (!projectID || !modelName) callback(new Error('The "id" parameter in the URL must be of form "projectUID::ModelGroupName"'))

  // 1. Token Authorization
  // check token active status and request new token if not active
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // get current token
  var token = config.ogcconnector.token
  const requestURL = config.ogcconnector.request_url
  const clientID = config.ogcconnector.client_id
  const clientSecret = config.ogcconnector.client_secret
  const scope = config.ogcconnector.scope
  const grantType = config.ogcconnector.grant_type

  // it appears the API server side checks for active token and returns same token if active
  // no need to test if token active in application if API already does that

  // define request body for token
  var reqBody = {
    "grant_type": grantType,
    "scope": scope,
    "client_id": clientID,
    "client_secret": clientSecret
  }

  // encode request body with URL form encoding
  var newToken
  // encode body
  reqBody = encode(reqBody)

  // call getToken to request new access token from Bentley API
  getToken(requestURL, reqBody).then(response => {newToken = response
    // overwrite existing config token
    const jsonPath = "./config/default.json"
    writeToken(jsonPath, newToken)
  })

  // then set token for API access
  token = config.ogcconnector.token 
   
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // 2. Declare API headers
  const apiHeaders = {
    "KeynetixCloud": keynetixCloud,
    "Authorization": `Bearer ${token}`,
    "Content-Type": contentType,
    "InstanceId": instanceID
  }

  // 3. Construct the OpenGroundCloud API request URLs
  const requrlOne = `${url}/boreholes/projects/${projectID}/locations`
  const requrlTwo = `${url}/data/projects/${projectID}/groups/${modelName}`

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //use Promise.all to get all needed data at one time to be merged and processed together
  Promise.all([crossFetch.fetch(requrlTwo, {method: "GET", headers: apiHeaders}).then(extraJson => { 
    if (!extraJson.ok) {
      const status = extraJson.status
      const statusText = extraJson.statusText
      throw new Error(`Request to ${requrlTwo} failed; ${status}, ${statusText}.`)
    }
    //console.log(`${extraJson.status} Connection Successful to ${requrlTwo}`)

    return extraJson.json()}),
  /////////////////////////////////
  crossFetch.fetch(requrlOne, {method: "GET", headers: apiHeaders}).then(detailJson => { 
    if (!detailJson.ok) {
      const status = detailJson.status
      const statusText = detailJson.statusText
      throw new Error(`Request to ${requrlOne} failed - verify you have a current access token; ${status}, ${statusText}.`)
    }
    //console.log(`${detailJson.status} Successful Connection to ${requrlOne}`)

    return detailJson.json()
  })]).then(([extraJson, detailJson]) => {
    // 4. merge the tables together here and return a table with only the complete data
    const mergedJson = mergeJson(extraJson, detailJson)
    const filteredJson = filterJson(mergedJson)

    // 5. Translate data to ESRI feature format
    const geojson = translate(filteredJson)

    // 6. Create Metadata
    //const geometryType = _.get(geojson, 'features[0].geometry.type', 'Point')
    geojson['metadata'] = { 
      geometryType: 'Point',
      description: 'OpenGround Cloud Boring Data'
     }
    
    // 7. Fire callback to provider with formatted data
    callback(null, geojson)

  }).catch(callback)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 8. Declare helper functions

// function to overwrite current token
function writeToken (path, newToken) {
  readFile(path, (error, data) => {
    if (error) {
      console.log(error)
      return
    }    
    var parsedData = JSON.parse(data)

    parsedData.ogcconnector.token = newToken
  
    writeFile(path, JSON.stringify(parsedData, null, 2), (err) => {
      if (err) {
        console.log("Failed to write updated token")
        return
      }
      //console.log("Updated file successfully")
    })
  })
}

// function to encode json body to url form encoded body
function encode (json) {
  var formBody = []
  for (var property in json) {
    var encodedKey = encodeURIComponent(property)
    var encodedValue = encodeURIComponent(json[property])
    formBody.push(encodedKey + "=" + encodedValue)
  }
  formBody = formBody.join("&")
  return formBody
}

// function to request token given formatted json body
async function getToken(requestURL, encodedBody) {
  const response = await crossFetch.fetch(requestURL, {method: "POST",
  headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
  body: encodedBody})
  
  // handle error if bad response
  if (!response.ok) {
    console.log(`Authorization token request error ${response.status}`)
  }

  const data = await response.json()

  newToken = data.access_token

  // return access token
  return data.access_token
}

// function to merge two json files together
function mergeJson (jsonOne, jsonTwo) {
  var merged = _.merge(_.keyBy(jsonOne, 'Id'), _.keyBy(jsonTwo, 'Id'))
  return _.values(merged)
}

// function to filter out null values
function filterJson(input) {
  return _.reject(input, {WGS84Geometry: null})
}

// helper function to create feature class from API input (data, no name table)
function translate (input) {
  //console.log('Made it to translation')
  return {
    type: 'FeatureCollection',
    features: input.map(formatFeature)
  }
}

// helper function to create feature class from API input (data, no name table)
function formatFeature (inputFeature) {
    // Most of what we need to do here is extract the longitude and latitude
    var coords = inputFeature.WGS84Geometry
    if(inputFeature.WGS84Geometry == null) {
      //console.log('null')
      coords = [0,0]
    } else {
      coords = coords.replace('POINT (', '') 
      coords = coords.replace(')', '')

      coords = coords.split(' ')
    }

    // Fix datafield name and pull out boring name
    const name = inputFeature.DataFields

    delete inputFeature['Geometry']
    delete inputFeature['BingGeometry']

    // translate two datafields   
    inputFeature['DataFields'] = name[0]['Header'] 
    inputFeature['BoringName'] = name[0]['Value']

    // create feature for feature class
    const feature = {
      type: "Feature",
      properties: inputFeature,
      geometry: {
        type: "Point",
        // long,lat
        coordinates: [Number(coords[0]), Number(coords[1])]
      }
    }
  return feature
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 9. Return the model exports to koop for hosting
module.exports = opengroundcloud