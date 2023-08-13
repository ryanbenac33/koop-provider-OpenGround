/*
  Author: Ryan Benac
  USACE MVR ECG

  great reference: https://github.com/koopjs/koop-provider-google-fusion-tables/blob/master/server.js
  about ngrok: https://medium.com/bigcommerce-developer-blog/how-to-test-app-authentication-locally-with-ngrok-149150bfe4cf
*/
// clean shutdown on `cntrl + c`
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

console.log(`\n-------------------------------------------------------------------------------------------------------------------------------------------------------`)
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
console.log(`\nOutputs Registered Successfully`)


console.log(`-------------------------------------------------------------------------------------------------------------------------------------------------------`)
console.log(`Registering Providers\n`)

const dataprovider = require('./')
const projectprovider = require('./provider-project/')

koop.register(dataprovider)
koop.register(projectprovider)

console.log(`\nProviders Registered Successfully`)

// Start listening for HTTP traffic
const config = require('config')
// Set port for configuration or fall back to default
const port = config.ogcconnector.port || 8080

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
    console.log(`\nAccess boring https:// ngrok link at: ${url}/opengroundcloud/rest/services/c613f0c4-e46d-4a7a-8e67-f7c9501169d0::LocationDetails/FeatureServer/0/query`)
    console.log(`NOTE: You can only access the ngrok link when DISCONNECTED from the CORPSNET`)
    console.log(`\nPress control + c to exit`)
    console.log(`-------------------------------------------------------------------------------------------------------------------------------------------------------`)
})
}

const message = `
Koop OpenGround Cloud Data Provider listening on ${port}
For more docs visit: https://koopjs.github.io/docs/specs/provider/
To find providers visit: https://www.npmjs.com/search?q=koop+provider

To see version information: http://localhost:8080/opengroundcloud/rest/info

Try it out in your browswer: http://localhost:${port}/opengroundcloud/rest/services/c613f0c4-e46d-4a7a-8e67-f7c9501169d0::LocationDetails/FeatureServer/0/query

View the projects at this link: http://localhost:${port}/opengroundprojects/projects::table/flat
http://localhost:${port}/opengroundcloud/rest/services/projects::table/FeatureServer/0/query

Press control + c to exit
`
console.log(`-------------------------------------------------------------------------------------------------------------------------------------------------------`)
console.log(message)
console.log(`-------------------------------------------------------------------------------------------------------------------------------------------------------`)