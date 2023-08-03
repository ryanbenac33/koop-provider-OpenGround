/*
  model.js

  //Author: Ryan Benac
  //USACE MVR ECG

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
  Best reference of all published providers: https://github.com/jking-gis/koop-provider-Salesforce/blob/master/Salesforce.js
  Node JS fix: https://www.lightly-dev.com/blog/node-js-fetch-is-not-defined/
  Secondary option for Fetch API using Request: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  */

//const request = require('request').defaults({ json: true })
const fetch = import('node-fetch') // requesting from API
const config = require('config')
const _ = require('lodash') // dealing with arrays and numbers
const crossFetch = require('cross-fetch') // fetch function fix for node js

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

  //${url}/boreholes/projects/${projectID}/locations
  //${url}/data/projects/${projectID}/groups/${modelName}

  // 1. Construct the OpenGroundCloud API request URL
  //const requrl = `${url}/data/projects/${projectID}/groups/${modelName}`
  const requrl = `${url}/boreholes/projects/${projectID}/locations`
  console.log(`\nAPI URL request: ${requrl}\n`)

  // 2. Make the request to the remote API
  crossFetch.fetch(requrl, {method: "GET", headers: {
    "KeynetixCloud": keynetixCloud,
    "Authorization": `Bearer ${token}`,
    "Content-Type": contentType,
    "InstanceId": instanceID
  }}).then(resp => { 
    if (!resp.ok) {
      const status = resp.status
      const statusText = resp.statusText
      throw new Error(`Request to ${requrl} failed; ${status}, ${statusText}.`)
    }

    // send message that connection was successful
    console.log(`${resp.status} Connection Successful\n`)

    return resp.json()
  }).then(json => {
    // Access each boring by doing json[i]
    //console.log(json[0])

    // 4. Create Metadata
    const geojson = translate(json)

    const geometryType = _.get(geojson, 'features[0].geometry.type', 'Point')
    geojson.metadata = { geometryType }

    console.log ("Processing Complete\n")
    //console.log(geojson)
    // 5. Fire callback
    callback(null, geojson)
  })
  // 6. Handle any errors
    .catch(callback)
}

function translate (input) {
  //console.log('Made it to translation')
  return {
    type: 'FeatureCollection',
    features: input.map(formatFeature)
  }
}

function formatFeature (inputFeature) {
  //skip over any null values
  
    
    //console.log('Made it to formatting')
    //console.log(inputFeature)

    // Most of what we need to do here is extract the longitude and latitude
    var coords = inputFeature.WGS84Geometry
    if(inputFeature.WGS84Geometry == null) {
      console.log('null')
      coords = [0,0]
    } else {
      coords = coords.replace('POINT (', '') 
      coords = coords.replace(')', '')

      coords = coords.split(' ')
    }
    //console.log(`Coordinates are ${coords[0]}, ${coords[1]}`)

    const feature = {
      type: 'Feature',
      properties: inputFeature,
      geometry: {
        type: 'Point',
        // long,lat
        coordinates: [coords[0], coords[1]]
      }
    }

    // But we also want to translate a few of the date fields so they are easier to use downstream
    const dateFields = ['Id', 'GroundLevel', 'FinalDepth', 'Geometry', 'BingGeometry', 'WGS84Geometry']
    dateFields.forEach(field => {
      feature.properties[field] = feature.properties[field]
    })
  
  return feature
  
}

module.exports = opengroundcloud

