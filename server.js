/*
  server.js

  //Author: Ryan Benac
  //USACE MVR ECG
  //Last Updated: 8/13/2023

  Note: See config/references.txt for reference and documentation links

  This file is required. It must run the Koop server and register the developed data provider

*/

// clean shutdown on `cntrl + c`
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

const consoleSeparator = "----------------------------------------------------------------------------"

console.log(`\n${consoleSeparator}`)
console.log(`Registering Outputs\n`)

// Initialize Koop
const Koop = require('@koopjs/koop-core')
const serverless = require("serverless-http")
const koop = new Koop()

/* Optional - register additional output-services */
// var tiles = require('@koopjs/output-vector-tiles')
// koop.register(tiles)

/* Optional - register any authorization plugins */
// const koopAuth = require('@koopjs/auth-direct-file')('foo', './user-store.json')
// koop.register(koopAuth)

/* Register providers */
const flat = require('./koop-output-flat')
koop.register(flat)

const tableOut = require('./Koop Output Table')
koop.register(tableOut)

console.log(`\nOutputs Registered Successfully`)

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.log(`${consoleSeparator}\n`)

const dataprovider = require('./')
koop.register(dataprovider)
console.log('\n')

const projectprovider = require('./provider-project')
koop.register(projectprovider)
console.log('\n')

console.log(`\nProviders Registered Successfully`)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Pull and write initial token
const config = require('config')

// import other defined functions
const tkn = require("./getToken/tokenFunctions")

// throw error if required configuration definition variables not defined
tkn.configCheck()

const requestURL = config.ogcconnector.request_url

// encode body with URL form encoding
reqBody = tkn.encode(tkn.getBody())

// call getToken to request new access token from Bentley API
tkn.getToken(requestURL, reqBody).then(response => {newToken = response
  // overwrite existing config token
  const jsonPath = "./config/default.json"
  tkn.writeToken(jsonPath, newToken)
  // console.log("New token registered")
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Start listening for HTTP traffic
// Set port for configuration or fall back to default
const port = config.ogcconnector.port || 8080

// check process
if (process.env.LAMBDA) {
  module.exports = koop.server
} else {
  koop.server.listen(port)
}

const message = `
Koop Server listening on ${port}
For more docs visit: https://koopjs.github.io/docs/specs/provider/
To find providers visit: https://www.npmjs.com/search?q=koop+provider
To see version information: http://localhost:8080/opengroundcloud/rest/info

******************************OpenGround Cloud**************************************
View boring data in your browser at these rest endpoints:
Feature Class: http://localhost:${port}/opengroundcloud/rest/services/77fd1c62-18d4-4bd5-ba58-ae1d01382c56::LocationDetails/FeatureServer/0/query
Flat JSON:     http://localhost:${port}/opengroundcloud/77fd1c62-18d4-4bd5-ba58-ae1d01382c56::LocationDetails/flat
Table:         http://localhost:${port}/opengroundcloud/77fd1c62-18d4-4bd5-ba58-ae1d01382c56::LocationDetails/table

View the projects in your browser at these rest endpoints: 
Feature Class: http://localhost:${port}/opengroundprojects/rest/services/projects/FeatureServer/0/query
Flat JSON:     http://localhost:${port}/opengroundprojects/projects/flat
Table:         http://localhost:${port}/opengroundprojects/projects/table

************************************************************************************

Press control + c to exit
`
console.log(consoleSeparator)
console.log(message)
console.log(consoleSeparator)