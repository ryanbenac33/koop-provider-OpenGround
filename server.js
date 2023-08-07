/*https://github.com/koopjs/koop-provider-google-fusion-tables/blob/master/server.js*/
// clean shutdown on `cntrl + c`
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

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

const dataprovider = require('./')
const projectprovider = require('./provider-project/')

koop.register(dataprovider)
console.log('\n')
koop.register(projectprovider)


// Start listening for HTTP traffic
const config = require('config')
// Set port for configuration or fall back to default
const port = config.ogcconnector.port || 8080

if (process.env.LAMBDA) {
  module.exports = koop.server
} else {
  koop.server.listen(port)
}

const message = `

Koop OpenGround Cloud Data Provider listening on ${port}
For more docs visit: https://koopjs.github.io/docs/specs/provider/
To find providers visit: https://www.npmjs.com/search?q=koop+provider

To see version information: http://localhost:8080/opengroundcloud/rest/info

Try it out in your browswer: http://localhost:${port}/opengroundcloud/rest/services/c613f0c4-e46d-4a7a-8e67-f7c9501169d0::LocationDetails/FeatureServer/0/query

View the projects at this link: http://localhost:${port}/opengroundprojects/projects::table/flat

Press control + c to exit
`
console.log(message)