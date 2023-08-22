const requestHandler = require('./request-handler')

function OutputFlatJSON () {}

OutputFlatJSON.prototype.serve = requestHandler
OutputFlatJSON.version = require('../package.json').version
OutputFlatJSON.type = 'output'
OutputFlatJSON.routes = [
  {
    path: 'flat',
    methods: ['get', 'post'],
    handler: 'serve'
  }
]

module.exports = OutputFlatJSON
