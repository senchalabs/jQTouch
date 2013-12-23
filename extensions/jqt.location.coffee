if $.jQT
  $.jQT.addExtension (jQT) ->
    latitude = null
    longitude = null

    updateLocation = (successCallback, failCallback) ->
      
      unless navigator.geolocation
        console.warn 'Device not capable of geolocation.'
        failCallback() if failCallback
        return no

      navigator.geolocation.getCurrentPosition (position) -> # Success callback
        latitude = position.coords.latitude
        longitude = position.coords.longitude

        successCallback(getLocation()) if successCallback

      , (error) ->
        failCallback error

    getLocation = ->
      if latitude and longitude
        latitude: latitude
        longitude: longitude
      else
        console.warn 'No location available. Try calling jQT.updateLocation() first.'
        false

    # Extend jQT object
    updateLocation: updateLocation
    getLocation: getLocation