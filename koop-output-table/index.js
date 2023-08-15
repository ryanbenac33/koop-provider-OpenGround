const requestHandler = require('./request-handler')

function OutputTable () {}

OutputTable.prototype.serve = requestHandler
OutputTable.version = require('../package.json').version
OutputTable.type = 'output'
OutputTable.routes = [
  {
    path: 'table',
    methods: ['get', 'post'],
    handler: 'serve'
  }
]

module.exports = OutputTable
