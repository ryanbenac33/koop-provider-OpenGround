const pkg = require('./package.json')

//const Koop = require("koop");
//const serverless = require("serverless-http");

// initiate a Koop app
//const koop = new Koop();

const provider = {
    name: 'opengroundcloud',
    type: 'provider',
    version: pkg.version,
    Model: require('./model'),
    hosts: false,
    disableIdParam: false,
    routes: pkg.routes,
    Controller: pkg.Controller,
  }

module.exports = provider

//module.exports.handler = serverless(koop.server);
