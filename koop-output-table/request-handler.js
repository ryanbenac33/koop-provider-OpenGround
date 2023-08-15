const winnow = require('@koopjs/winnow')
const _ = require('lodash')
const flatten = require('flat')

/**
 * Handle a request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function requestHandler (req, res) {
  this.model.pull(req, (error, geojson) => {
    if (error) {
      return res.status(error.code || 500).json({ error })
    }

    // send data to winnow; filter the data according to query
    const options = _.cloneDeep(req.query)
    options.toEsri = false
    const filteredGeojson = winnow.query(geojson, options)

    // Extract geojson properties, flatten any nested properties
    const records = filteredGeojson.features.map(function (feature) {
      return flatten(feature.properties)
    })

    res.status(200).send(records)
  })
}

module.exports = requestHandler
