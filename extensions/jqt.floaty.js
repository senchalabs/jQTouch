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
        $.jQTouch.addExtension(function Floaty(jQT){
            
            $.fn.makeFloaty = function(options){
                var defaults = {
                    align: 'top',
                    spacing: 20,
                    time: '.3s'
                }
                var settings = $.extend({}, defaults, options);
                settings.align = (settings.align == 'top') ? 'top' : 'bottom';
                
                return this.each(function(){
                    var $el = $(this);
                    
                    $el.css({
                        '-webkit-transition': 'top ' + settings.time + ' ease-in-out',
                        'display': 'block',
                        'min-height': '0 !important'
                    }).data('settings', settings);
                    
                    $(document).bind('scroll', function(){
                        if ($el.data('floatyVisible') === true)
                        {
                            $el.scrollFloaty();
                        }
                    });
                    $el.scrollFloaty();
                });
            }

            $.fn.scrollFloaty = function(){
                return this.each(function(){
                    var $el = $(this);
                    var settings = $el.data('settings');
                    var wHeight = $('html').attr('clientHeight'); // WRONG
                    
                    var newY = window.pageYOffset +
                        ((settings.align == 'top') ? 
                            settings.spacing : wHeight - settings.spacing - $el.get(0).offsetHeight);
                    
                    $el.css('top', newY).data('floatyVisible', true);
                });
            }

            $.fn.hideFloaty = function(){
                return this.each(function(){
                    var $el = $(this);
                    var oh = $el.get(0).offsetHeight;
                    
                    $el.css('top', -oh-10).data('floatyVisible', false);
                });
            }
            
            $.fn.toggleFloaty = function(){
                return this.each(function(){
                    var $el = $(this);
                    if ($el.data('floatyVisible') === true){
                        $el.hideFloaty();
                    }
                    else
                    {
                        $el.scrollFloaty();
                    }
                });
            }
        });
    }
})(jQuery);