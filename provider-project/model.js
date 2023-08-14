/*
  model.js

  //Author: Ryan Benac
  //USACE MVR ECG

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
  */

//const request = require('request').defaults({ json: true })
const fetch = import('node-fetch') // requesting from API
const config = require('../config/default.json')
const _ = require('../node_modules/lodash') // dealing with arrays and numbers
const crossFetch = require('../node_modules/cross-fetch') // fetch function fix for node js

const tkn = require("../getToken/tokenFunctions")

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
const port = config.ogcconnector.port

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
  const project = details[0]
  const output = details[1]

  // throw error if id in the wrong format
  if (!project || !output) callback(new Error('The "id" parameter in the URL must be of form "projects::output"'))
  if (project !== "projects") callback(new Error('The first "id" parameter in the URL must be "projects"'))
  
  // 1. declare API headers
  const apiHeaders = {
    "KeynetixCloud": keynetixCloud,
    "Authorization": `Bearer ${token}`,
    "Content-Type": contentType,
    "InstanceId": instanceID
  }

  // 2. Construct the OpenGroundCloud API request URLs
  const requrlOne = `${url}/data/projects`
  //console.log(`\nAPI URL request: ${requrlOne}\n`)

  console.log(requrlOne)
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //use Promise.all to get all needed data at one time to be merged and processed together
  Promise.all([
  crossFetch.fetch(requrlOne, {method: "GET", headers: apiHeaders}).then(projects => { 
    if (!projects.ok) {
      const status = projects.status
      const statusText = projects.statusText
      throw new Error(`Request to ${requrlOne} failed - verify you have a current access token; ${status}, ${statusText}.`)
    }
    //console.log(`${projects.status} Successful Connection to ${requrlOne}`)

    return projects.json()
  })]).then(([projects]) => {
    // 3. merge the tables together here and return a table with only the complete data
    const fixedProjets = fixProjectInfo(projects)

    // 5. Create Metadata
    const geometryType = _.get(fixedProjets, 'features[0].geometry.type', 'Point')
    fixedProjets.metadata = { geometryType }

    // 6. Fire callback to provider with formatted data
    callback(null, fixedProjets)

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
    currentObj['BoringName'] = currentObj['DataFields'][0]['Value']
    
    // remove unneccessary JSON fields
    delete currentObj['DataFields']
    delete currentObj['Group']
    delete currentObj['HasDocuments']

    // add testing URL
    currentObj['TestingURL'] = `http://localhost:${port}/opengroundcloud/rest/services/${currentObj['Id']}::LocationDetails/FeatureServer/0/query`
  }
  
  return json
}

// helper function to create feature class from API input (data, no name table)
function translate (input) {
  //console.log('Made it to translation')
  return {
    type: 'FeatureCollection',
    features: input.map(formatFeature)
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 8. Return the model exports to koop for hosting
module.exports = opengroundcloud