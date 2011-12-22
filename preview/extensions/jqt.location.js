/*

            _/    _/_/    _/_/_/_/_/                              _/       
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/    
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/   
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/    
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/     
       _/                                                                  
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>
    
    Special thanks to Jonathan Stark <http://jonathanstark.com/>
    and pinch/zoom <http://www.pinchzoom.com/>
    
    (c) 2009 by jQTouch project members.
    See LICENSE.txt for license.

*/

(function($) {
    if ($.jQTouch)
    {
        $.jQTouch.addExtension(function Location(){
            
            var latitude, longitude, callback;
            
            function checkGeoLocation() {
                return navigator.geolocation;
            }
            function updateLocation(fn) {
                if (checkGeoLocation())
                {
                    callback = fn;
                    navigator.geolocation.getCurrentPosition(savePosition);
                    return true;
                } else {
                    console.log('Device not capable of geo-location.');
                    fn(false);
                    return false;
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
                    }
                } else {
                    console.log('No location available. Try calling updateLocation() first.');
                    return false;
                }
            }
            return {
                updateLocation: updateLocation,
                getLocation: getLocation
            }
        });
    }
})(jQuery);