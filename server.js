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

const tableOut = require('./koop-output-table')
koop.register(tableOut)

console.log(`\nOutputs Registered Successfully`)

/////////////////////////////////////////////////////////////////////////////////////////////
console.log(`${consoleSeparator}\n`)

const dataprovider = require('./')
const projectprovider = require('./provider-project/')

koop.register(dataprovider)
console.log('\n')
koop.register(projectprovider)

console.log(`\nProviders Registered Successfully`)
/////////////////////////////////////////////////////////////////////////////////////////////

// Start listening for HTTP traffic
const config = require('config')
// Set port for configuration or fall back to default
const port = config.ogcconnector.port || 8080

// check process
if (process.env.LAMBDA) {
  module.exports = koop.server
} else {
  koop.server.listen(port)
}

// get development mode status
const devStatus = config.ogcconnector.devMode

// start ngrok if in development mode
if(devStatus) {
  // set up ngrok testing for https connection to ESRI
  const ngrok = require('ngrok')

  ngrok.connect({
    proto: "http",
    addr: port,
    }).then(url => {
    console.log(`\nngrok is running at ${url}`)
    console.log(`Check the status of ngrok at: http://127.0.0.1:4040/status`)
    console.log(`\nAccess boring https:// ngrok link at: ${url}/opengroundcloud/rest/services/77fd1c62-18d4-4bd5-ba58-ae1d01382c56::LocationDetails/FeatureServer/0/query`)
    console.log(`NOTE: You can only access the ngrok link when DISCONNECTED from the CORPSNET`)
    console.log(`\nPress control + c to exit`)
    console.log(consoleSeparator)
})
}

const message = `
Koop OpenGround Cloud Data Provider listening on ${port}
For more docs visit: https://koopjs.github.io/docs/specs/provider/
To find providers visit: https://www.npmjs.com/search?q=koop+provider
To see version information: http://localhost:8080/opengroundcloud/rest/info

************************************************************************************
View boring data in your browser:
Feature Class: http://localhost:${port}/opengroundcloud/rest/services/77fd1c62-18d4-4bd5-ba58-ae1d01382c56::LocationDetails/FeatureServer/0/query
Flat JSON:     http://localhost:${port}/opengroundcloud/77fd1c62-18d4-4bd5-ba58-ae1d01382c56::LocationDetails/flat
Table:         http://localhost:${port}/opengroundcloud/77fd1c62-18d4-4bd5-ba58-ae1d01382c56::LocationDetails/table

View the projects in your browser: 
Feature Class: http://localhost:${port}/opengroundprojects/rest/services/projects/FeatureServer/0/query
Flat JSON:     http://localhost:${port}/opengroundprojects/projects/flat
Table:         http://localhost:${port}/opengroundprojects/projects/table
************************************************************************************

Press control + c to exit
`
console.log(consoleSeparator)
console.log(message)
console.log(consoleSeparator)