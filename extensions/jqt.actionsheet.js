/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Maintained by Thomas Yip <http://beedesk.com/>
    Sponsored by Sencha Labs <http://www.sencha.com/>
    Special thanks to Jonathan Stark <http://www.jonathanstark.com/>

    Documentation and issue tracking on GitHub <http://github.com/senchalabs/jQTouch/>

    (c) 2009-2012 Sencha Labs
    jQTouch may be freely distributed under the MIT license.
*/

(function($) {
    // load css
    var src = $("head script").last().attr("src") || '';
    var scriptpath = src.split('?')[0].split('/').slice(0, -1).join('/')+'/';
    var csspath = scriptpath + 'jqt.actionsheet.css';
    var link = $('<link href="' + csspath + '" rel="stylesheet">');
    $('head').append($(link));

    function hide(callback) {
        var $target = $(this),
            $jqt = $('#jqt');

        $target
            .addClass('transition')
            .removeClass('shown')
            .one('webkitTransitionEnd', function(event) {
                if (event.target === this) {
                    $target.removeClass('transition');              
                    !callback || callback.apply(this, arguments);
                }
            });

        $jqt
            .addClass('transition') 
            .removeClass('modal')
            .find('.current')
                .one('webkitTransitionEnd watchdog', function(event) {
                    if (event.target === this) {
                        $jqt.removeClass('transition');
                    }
                })
                .each(function() {
                    // to take care of the case where .current
                    // become display: none and animation ceased
                    var $current = $(this);
                    setTimeout(function() {
                        $current.trigger('watchdog');
                    }, 500);                  
                });

        return $target;
    }
      
    function show(callback) {
        var $target = $(this),
            $jqt = $('#jqt');

        $target
            .addClass('transition')
            .one('webkitTransitionEnd', function(event) {
                if (event.target === this) {
                    $target.removeClass('transition');              
                    !callback || callback.apply(this, arguments);
                }
            });

        $jqt
            .addClass('transition')
            .find('.current')
                .one('webkitTransitionEnd', function(event) {
                    if (event.target === this) {
                        $jqt.removeClass('transition');
                    }
                });

        setTimeout(function() {
            $target.addClass('shown');
            $jqt.addClass('modal');
        }, 25);
        return $target;
    }
    
    var methods = {
        init: function(options) {
            $(this).addClass('actionsheet');
        },
        show: show,
        hide: hide
    };
    
    $.fn.actionsheet = function(method) {
      if (methods[method]) {
          if ($(this).is('.actionsheet')) {
              return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
          } else {
              var msg = 'Target is not a `actionsheet`. Action `' + method + '` is ignored.';
              console.warn(msg);
          }
      } else if ( typeof method === 'object' || ! method ) {
          return methods.init.apply(this, arguments);
      } else {
          $.error('Method "' + method + '" does not exist on jqt.actionsheet' );
      }        
    };

    if ($.jQT) {
        $.jQT.addTapHandler({
            name: 'open-actionsheet',
            isSupported: function(e, params) {
                return params.$el.is('.action');
            },
            fn: function(e, params) {
                params.$el.closest('.active').removeClass('active');

                var $target = $(params.hash);
                $target.actionsheet('show');

                return false;
            }
        });
        $.jQT.addTapHandler({
            name: 'follow-actionlink',
            isSupported: function(e, params) {
                if ($('#jqt > .actionsheet.shown').length > 0) {
                    return params.$el.is('.actionsheet a');
                }
                return false;
            },
            fn: function(e, params) {
                params.$el.closest('.active').removeClass('active');

                var $target = params.$el.closest('.actionsheet');
                $target.actionsheet('hide', function() {
                    if (!params.$el.is('.dismiss')) {
                      params.$el.trigger('tap');
                      setTimeout(function() {
                        params.$el.removeClass('active');
                      }, 100);
                    }
                });
                return false;
            }
        });
    } else {
        console.error('Extension `jqt.actionsheet` failed to load. jQT not found');
    }
})($);
