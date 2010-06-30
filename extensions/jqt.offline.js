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

    Lots of this code is specifically derived from Jonathan's book,
    "Building iPhone Apps with HTML, CSS, and JavaScript"
    
    (c) 2009 by jQTouch project members.
    See LICENSE.txt for license.

*/

(function($) {
    if ($.jQTouch)
    {
        $.jQTouch.addExtension(function Offline(){
            
            // Convenience array of status values
            var cacheStatusValues = [];
            cacheStatusValues[0] = 'uncached';
            cacheStatusValues[1] = 'idle';
            cacheStatusValues[2] = 'checking';
            cacheStatusValues[3] = 'downloading';
            cacheStatusValues[4] = 'updateready';
            cacheStatusValues[5] = 'obsolete';

            // Listeners for all possible events
            var cache = window.applicationCache;
            cache.addEventListener('cached', logEvent, false);
            cache.addEventListener('checking', logEvent, false);
            cache.addEventListener('downloading', logEvent, false);
            cache.addEventListener('error', logEvent, false);
            cache.addEventListener('noupdate', logEvent, false);
            cache.addEventListener('obsolete', logEvent, false);
            cache.addEventListener('progress', logEvent, false);
            cache.addEventListener('updateready', logEvent, false);

            // Log every event to the console
            function logEvent(e) {
                var online, status, type, message;
                online = (isOnline()) ? 'yes' : 'no';
                status = cacheStatusValues[cache.status];
                type = e.type;
                message = 'online: ' + online;
                message+= ', event: ' + type;
                message+= ', status: ' + status;
                if (type == 'error' && navigator.onLine) {
                    message+= ' There was an unknown error, check your Cache Manifest.';
                }
                console.log(message);
            }
            
            function isOnline() {
                return navigator.onLine;
            }
            
            if (!$('html').attr('manifest')) {
                console.log('No Cache Manifest listed on the <html> tag.')
            }

            // Swap in newly download files when update is ready
            cache.addEventListener('updateready', function(e){
                    // Don't perform "swap" if this is the first cache
                    if (cacheStatusValues[cache.status] != 'idle') {
                        cache.swapCache();
                        console.log('Swapped/updated the Cache Manifest.');
                    }
                }
            , false);

            // These two functions check for updates to the manifest file
            function checkForUpdates(){
                cache.update();
            }
            function autoCheckForUpdates(){
                setInterval(function(){cache.update()}, 10000);
            }

            return {
                isOnline: isOnline,
                checkForUpdates: checkForUpdates,
                autoCheckForUpdates: autoCheckForUpdates
            }
        });
    }
})(jQuery);