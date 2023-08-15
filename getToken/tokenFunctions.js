const fetch = import('node-fetch') // requesting from API
const config = require('../config/default.json')
const _ = require('lodash') // dealing with arrays and numbers
const crossFetch = require('cross-fetch') // fetch function fix for node js
const {writeFile, readFile} = require("fs")

// function to overwrite current token
function writeToken (path, newToken) {
    readFile(path, (error, data) => {
        if (error) {
        console.log(error)
        return
        }    
        var parsedData = JSON.parse(data)

        // write new token to default.json config file
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
    // loop through to encode each item in json
    for (var property in json) {
        var encodedKey = encodeURIComponent(property)
        var encodedValue = encodeURIComponent(json[property])
        formBody.push(encodedKey + "=" + encodedValue)
    }
    // join list so it is formatted for body request
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

// get and format body request
function getBody () {
    const clientID = config.ogcconnector.client_id
    const clientSecret = config.ogcconnector.client_secret
    const scope = config.ogcconnector.scope
    const grantType = config.ogcconnector.grant_type

    return {
        "grant_type": grantType,
        "scope": scope,
        "client_id": clientID,
        "client_secret": clientSecret
      }
}

// get headers for data api requests
function getHeaders(token) {
    const instanceID = config.ogcconnector.instanceID
    const keynetixCloud = config.ogcconnector.keynetixCloud
    const contentType = config.ogcconnector.contentType

    return {
        "KeynetixCloud": keynetixCloud,
        "Authorization": `Bearer ${token}`,
        "Content-Type": contentType,
        "InstanceId": instanceID
      }
}

// check config for error
function configCheck() {
    // throw error if required configuration definition variables not defined
    if (!config.ogcconnector.instanceID) throw new Error(`CONFIG ERROR: Instance ID must be defined in the config.`)
    if (!config.ogcconnector.keynetixCloud) throw new Error(`CONFIG ERROR: Keynetix Cloud Instance must be defined in the config.`)
    if (!config.ogcconnector.contentType) throw new Error(`CONFIG ERROR: Content type must be defined in the config.`)
    if (!config.ogcconnector.token) throw new Error(`CONFIG ERROR: Token must be defined in the config.`)
    if (!config.ogcconnector.url) throw new Error(`CONFIG ERROR: API access URL must be defined in the config.`)
    if (!config.ogcconnector.client_secret) throw new Error(`CONFIG ERROR: Client secret (service account) must be defined in the config.`)
    if (!config.ogcconnector.client_id) throw new Error(`CONFIG ERROR: Client ID (service account) must be defined in the config.`)
    if (!config.ogcconnector.scope) throw new Error(`CONFIG ERROR: Scope (service account) must be defined in the config.`)
    if (!config.ogcconnector.grant_type) throw new Error(`CONFIG ERROR: Credential grant type (service account) must be defined in the config.`)
    if (!config.ogcconnector.request_url) throw new Error(`CONFIG ERROR: Token request URL must be defined in the config.`)
}

module.exports = {writeToken, encode, getToken, getBody, getHeaders, configCheck}