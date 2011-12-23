(function($) {
    if ($.jQTouch)
    {
        $.jQTouch.addExtension(function Location(){
            
            var latitude, longitude, callback, callback2;
            
            function updateLocation(fn, fn2) {
                if (navigator.geolocation)
                {
                    callback = fn;
                    callback2 = fn2;
                    navigator.geolocation.getCurrentPosition(savePosition, failResponse);
                    return true;
                } else {
                    console.log('Device not capable of geo-location.');
                    fn(false);
                    return false;
                }
            }
            function failResponse(error){
                if (callback2) {
                    callback2(error);
                }
            }
            function savePosition(position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                if (callback) {
                    callback(getLocation());
                }
            }
            function getLocation() {
                if (latitude && longitude) {
                    return {
                        latitude: latitude,
                        longitude: longitude
                    };
                    
                } else {
                    console.log('No location available. Try calling updateLocation() first.');
                    return false;
                }
            }
            return {
                updateLocation: updateLocation,
                getLocation: getLocation
            };
        });
    }
})($);