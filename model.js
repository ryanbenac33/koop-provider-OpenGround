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

  /*const headDetails = {
    "KeynetixCloud": keynetixCloud,
    "Authorization": `Bearer ${token}`,
    "Content-Type": contentType,
    "InstanceId": instanceID
  }*/

  // 1. Construct the OpenGroundCloud API request URL
  const requrl = `${url}/data/projects/${projectID}/groups/${modelName}`
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
  }).then(geojson => {
    // Access each boring by doing geojson[i]
    //console.log(geojson[0])

    // 4. Create Metadata
    
    const geometryType = _.get(geojson, 'features[0].geometry.type', 'Point')
    geojson.metadata = { geometryType }

    // 5. Fire callback
    callback(null, geojson)
  })
  // 6. Handle any errors
    .catch(callback)
}

/*
  // Make the auth request
    var requestOptions = {
      url: url,
      KeynetixCloud: keynetixCloud,
      Authorization: {
        Bearer: token
      },
      "Content-Type": contentType,
      InstanceId: instanceID
    }


    // Make the Account data request
    request.get(requestOptions, (err, httpResponse, body) => {
      if (err) return callback(err)

      // Translate geojson
      const json = translate(body)
      json.metadata = {
        title: 'OpenGround Cloud Koop Provider',
        name: 'OpenGround Cloud Projects',
        description: `Generated from ${url}`,
        displayField: 'DataFields',
        idField: 'Id',
        maxRecordCount: 10000,
      }

      // Return result for serving to ArcGIS
      callback(null, json)
    })
  }

  function translate (input) {
    return {
      type: 'FeatureCollection',
      features: input.records ? input.records.reduce(formatFeature, [], 0) : []
    }
  }

  function formatFeature (sum, inputFeature, index) {
    // Most of what we need to do here is extract the longitude and latitude
    const url = config.ogcconnector.url
  
    // Delete this property because it's a JSON object
    if (inputFeature.attributes) {
      delete inputFeature.attributes
    }
  
    if (inputFeature.Id) {
      inputFeature.url = url + '/lightning/r/Account/' + inputFeature.Id + '/view'
    }
  
    // Make an objectID the index of the reduce function
    inputFeature.OBJECTID = index + 1
  
    if (inputFeature.BillingLongitude && inputFeature.BillingLatitude) {
      const feature = {
        type: 'Feature',
        properties: inputFeature,
        geometry: {
          type: 'Point',
          coordinates: [inputFeature.BillingLongitude, inputFeature.BillingLatitude]
        }
      }
      sum.push(feature)
    }
    return sum
  }
*/

module.exports = opengroundcloud

