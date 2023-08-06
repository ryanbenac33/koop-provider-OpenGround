const pkg = require('./package.json')
const provider = {
    name: 'opengroundprojects',
    type: 'provider',
    version: pkg.version,
    Model: require('./model'),
    hosts: false,
    disableIdParam: false,
    routes: pkg.routes,
    Controller: pkg.Controller,
  }

  module.exports = provider