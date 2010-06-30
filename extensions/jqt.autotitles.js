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
        $.jQTouch.addExtension(function AutoTitles(jQT){
            
            var titleSelector='.toolbar h1';

            $(function(){
                $('#jqt').bind('pageAnimationStart', function(e, data){
                    if (data.direction === 'in'){
                        var $title = $(titleSelector, $(e.target));
                        var $ref = $(e.target).data('referrer');
                        if ($title.length && $ref){
                            $title.html($ref.text());
                        }
                    }
                });
            });
            
            function setTitleSelector(ts){
                titleSelector=ts;
            }
            
            return {
                setTitleSelector: setTitleSelector
            }

        });
    }
})(jQuery);