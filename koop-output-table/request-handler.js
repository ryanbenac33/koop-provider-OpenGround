/*
  //Author: Ryan Benac
  //USACE MVR ECG
  //Last Updated: 8/20/2023
*/

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

    // Extract geojson properties, flatten any nested properties, work with flattened data
    const records = filteredGeojson.features.map(function (feature) {
      return flatten(feature.properties)
    })

    //https://stackoverflow.com/questions/51188542/how-to-build-a-dynamic-html-table-from-json-data-using-node-js
    const row = html => `<tr>\n${html}</tr>\n`,
      heading = object => row(Object.keys(object).reduce((html, heading) => (html + `<th>${heading}</th>`), '')),
      datarow = object => row(Object.values(object).reduce((html, value) => (html + `<td>${value}</td>`), ''));
                               
    function htmlTable(dataList) {
      return `<table id="myTable">${heading(dataList[0])}${dataList.reduce((html, object) => (html + datarow(object)), '')}</table>`
    }

    // specify table borders
    const head = '<head><script src = "https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script></head>'

    const css = '<style>table, th, td {border: 1px solid black; border-collapse: collapse;} #myInput {background-image: url("/css/searchicon.png"; background-position: 10px 12px; background-repeat: no-repeat;width: 100%;font-size: 16px; padding: 12px 20px 12px 40px;border: 1px solid #ddd;margin-bottom: 12px;}#myTable {border-collapse: collapse; width: 100%; border: 1px solid #ddd; font-size: 18px; }#myTable th, #myTable td {text-align: left; padding: 12px; } #myTable tr {border-bottom: 1px solid #ddd;} #myTable tr.header, #myTable tr:hover {background-color: #f1f1f1;}</style>'

    const search = '<input id="myInput" type="text" placeholder="Search table...">'

    const script = '<script>$(document).ready(function() {$("#myInput").on("keyup", function() {var value = $(this).val().toLowerCase();$("#myTable tr").filter(function() {$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)}); });});</script>'

    //create table from JSON
    const tabled = htmlTable(records)

    // append css
    const styled = '<html>' + head + '<body><h2>Koop: Data Table Output</h2>' + css + search + '<br><br>' + tabled + script + '</body>' + '</html>'

    // send it for output
    res.status(200).send(styled)
  })
}

module.exports = requestHandler
