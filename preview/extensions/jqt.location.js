(function() {
  if ($.jQT) {
    $.jQT.addExtension(function(jQT) {
      var getLocation, latitude, longitude, updateLocation;
      latitude = null;
      longitude = null;
      updateLocation = function(successCallback, failCallback) {
        if (!navigator.geolocation) {
          console.warn('Device not capable of geolocation.');
          if (failCallback) {
            failCallback();
          }
          return false;
        }
        return navigator.geolocation.getCurrentPosition(function(position) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          if (successCallback) {
            return successCallback(getLocation());
          }
        }, function(error) {
          return failCallback(error);
        });
      };
      getLocation = function() {
        if (latitude && longitude) {
          return {
            latitude: latitude,
            longitude: longitude
          };
        } else {
          console.warn('No location available. Try calling jQT.updateLocation() first.');
          return false;
        }
      };
      return {
        updateLocation: updateLocation,
        getLocation: getLocation
      };
    });
  }

}).call(this);
