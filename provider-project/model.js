/*
  model.js

  //Author: Ryan Benac
  //USACE MVR ECG

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
  */

//const request = require('request').defaults({ json: true })
const fetch = import('node-fetch') // requesting from API
const config = require('./config')
const _ = require('./lodash') // dealing with arrays and numbers
const crossFetch = require('./cross-fetch') // fetch function fix for node js

// throw error if request variables not defined
if (!config.ogcconnector.instanceID) throw new Error(`ERROR: Instance ID must be defined in your config.`)
if (!config.ogcconnector.keynetixCloud) throw new Error(`ERROR: Keynetix Cloud Instance must be defined in your config.`)
if (!config.ogcconnector.contentType) throw new Error(`ERROR: Content type must be defined in your config.`)
if (!config.ogcconnector.token) throw new Error(`ERROR: Token must be defined in your config.`)
if (!config.ogcconnector.url) throw new Error(`ERROR: API access URL must be defined in your config.`)

// pull all the config.json data
const instanceID = config.ogcconnector.instanceID
const keynetixCloud = config.ogcconnector.keynetixCloud
const contentType = config.ogcconnector.contentType
const token = config.ogcconnector.token
const url = config.ogcconnector.url

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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

  // 1. declare API headers
  const apiHeaders = {
    "KeynetixCloud": keynetixCloud,
    "Authorization": `Bearer ${token}`,
    "Content-Type": contentType,
    "InstanceId": instanceID
  }

  // 2. Construct the OpenGroundCloud API request URLs
  const requrlOne = `${url}/boreholes/projects/${projectID}/locations`
  const requrlTwo = `${url}/data/projects/${projectID}/groups/${modelName}`
  //console.log(`\nAPI URL request: ${requrlOne}\n`)
  //console.log(`\nAPI URL request: ${requrlTwo}\n`)

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
    // 3. merge the tables together here and return a table with only the complete data
    const mergedJson = mergeJson(extraJson, detailJson)
    const filteredJson = filterJson(mergedJson)

    // 4. Translate data to ESRI feature format
    const geojson = translate(filteredJson)

    // 5. Create Metadata
    const geometryType = _.get(geojson, 'features[0].geometry.type', 'Point')
    geojson.metadata = { geometryType }

    // 6. Fire callback to provider with formatted data
    callback(null, geojson)

  }).catch(callback)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 7. Declare helper functions

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

    // translate two datafields   
    inputFeature['DataFields'] = name[0]['Header'] 
    inputFeature['BoringName'] = name[0]['Value']

    // create feature for feature class
    const feature = {
      type: 'Feature',
      properties: inputFeature,
      geometry: {
        type: 'Point',
        // long,lat
        coordinates: [coords[0], coords[1]]
      }
    }
  return feature
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 8. Return the model exports to koop for hosting
module.exports = opengroundcloud