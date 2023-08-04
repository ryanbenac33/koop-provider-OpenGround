  /*
  // 3. Make request for boring names then use in request for data
  crossFetch.fetch(requrlTwo, {method: "GET", headers: apiHeaders}).then(resp => { 
    if (!resp.ok) {
      const status = resp.status
      const statusText = resp.statusText
      throw new Error(`Request to ${requrlTwo} failed; ${status}, ${statusText}.`)
    }
    console.log(`${resp.status} Connection Successful to second table`)

    return resp.json()
  }).then(extraJson => {
    const extraGeojson = translateNames(extraJson)

    //const geometryType = _.get(geojson, 'features[0].geometry.type', 'Point')
    //geojson.metadata = { geometryType }

    console.log ("Processing Secondary Complete")
  })

  //console.log(namedGeoJSON)

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 4. Make the request to the remote API for the boring details and location
  crossFetch.fetch(requrlOne, {method: "GET", headers: apiHeaders}).then(resp => { 
    if (!resp.ok) {
      const status = resp.status
      const statusText = resp.statusText
      throw new Error(`Request to ${requrlOne} failed - verify you have a current access token; ${status}, ${statusText}.`)
    }

    // send message that connection was successful
    console.log(`${resp.status} Main Connection Successful`)

    return resp.json()
  }).then(json => {
    
    // 6. Create Metadata
    const geojson = translate(json)

    const geometryType = _.get(geojson, 'features[0].geometry.type', 'Point')
    geojson.metadata = { geometryType }

    console.log ("Processing Main Complete")

    // 7. Fire callback to provider with formatted data
    callback(null, geojson)

  })
  // 8. Handle any errors
    .catch(callback)
}
*/