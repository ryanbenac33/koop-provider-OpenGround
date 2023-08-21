/*
  model.js

  //Author: Ryan Benac
  //USACE MVR ECG

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
  */

//const request = require('request').defaults({ json: true })
const fetch = import('node-fetch') // requesting from API
const config = require('config')
const _ = require('lodash') // dealing with arrays and numbers
const crossFetch = require('cross-fetch') // fetch function fix for node js
const {writeFile, readFile} = require("fs")

const tkn = require("../getToken/tokenFunctions")

// throw error if request variables not defined
tkn.configCheck()

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 1. Token Authorization
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // define requestURL
  const requestURL = config.ogcconnector.request_url

  // encode body with URL form encoding
  reqBody = tkn.encode(tkn.getBody())

  // call getToken to request new access token from Bentley API
  tkn.getToken(requestURL, reqBody).then(response => {newToken = response
    // overwrite existing config token
    const jsonPath = "./config/default.json"
    tkn.writeToken(jsonPath, newToken)
  })

  // then set token for API access
  var token = config.ogcconnector.token 


function opengroundcloud (koop) {}

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// Config parameters (config/default.json)
// req.

opengroundcloud.prototype.getData = function getData (req, callback) {
  // get the host and id
  const { host, id } = req.params

  // throw error if id not projects
  if (req.params.id !== "projects") callback(new Error('The first "id" parameter in the URL must be "projects"'))
  
  // 2. Declare API data request headers
  const apiHeaders = tkn.getHeaders(token)

  // 2. Construct the OpenGroundCloud API request URLs
  const url = config.ogcconnector.url
  const requrlOne = `${url}/data/projects`
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //use Promise.all to get all needed data at one time to be processed
  Promise.all([
  crossFetch.fetch(requrlOne, {method: "GET", headers: apiHeaders}).then(projects => { 
    if (!projects.ok) {
      const status = projects.status
      const statusText = projects.statusText
      throw new Error(`Request to ${requrlOne} failed - verify you have a current access token; ${status}, ${statusText}.`)
    }

    return projects.json()
  })]).then(([projects]) => {
    // 3. merge the tables together here and return a table with only the complete data
    const fixedProjets = fixProjectInfo(projects)

    const geojson = translate(fixedProjets)

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

// 7. Declare helper functions

//fix the project info table
function fixProjectInfo (json) {
  var count = Object.keys(json).length
  //fixedJson['DataFields'] = fixedJson['DataFields']['Value'][0]

  // iterate over JSON to get actual name
  for (var i = 0; i < count; i++) {
    var currentObj = json[i]
    currentObj['ProjectName'] = currentObj['DataFields'][0]['Value']

    const id = currentObj['Id']

    currentObj['AccessURL'] = `<a href ="http://localhost:8080/opengroundcloud/rest/services/${id}::LocationDetails/FeatureServer/0/query">http://localhost:8080/opengroundcloud/rest/services/${id}::LocationDetails/FeatureServer/0/query</a>`

    // remove unneccessary JSON fields
    delete currentObj['DataFields']
    delete currentObj['Group']
    delete currentObj['HasDocuments']

  }
  return json
}

// helper function to create feature class from API project data input

function translate (input) {
  //console.log('Made it to translation')
  return {
    type: 'FeatureCollection',
    features: input.map(formatFeature)
  }
}

// helper function to create feature class from API project data input
function formatFeature (inputFeature) {
  // Most of what we need to do here is extract the longitude and latitude
  const coords = [0,0]

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

// 8. Return the model exports to koop for hosting
module.exports = opengroundcloud