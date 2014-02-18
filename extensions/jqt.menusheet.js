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
    var src = $("head script").last().attr("src") || '';
    var scriptpath = src.split('?')[0].split('/').slice(0, -1).join('/')+'/';
    var csspath = scriptpath + 'jqt.menusheet.css';
    var link = $('<link href="' + csspath + '" rel="stylesheet">');
    $('head').append($(link));

    function hide(callback) {
        var $target = $(this);
        var data = $(this).data('menusheet');
        if (data.shown) {
            $(this).data('menusheet', {});
            var $source = data.source;
            $target.trigger('pageAnimationStart', {
                direction: 'out', animation: undefined, back: true
            });
            $source.unbind('touchstart mousedown', data.closehandler);
            $source.one('webkitTransitionEnd', function() {
                $source.removeClass('inmotion transition in');
                $target.removeClass('inmotion out');
                $target.trigger('pageAnimationEnd', {
                    direction: 'out', animation: undefined, back: true
                });
                !callback || callback.apply(this, arguments);
            });
    
            $source.addClass('inmotion transition in');
            $target.addClass('inmotion out').removeClass('current');
            $('#jqt').removeClass('menuopened');
        }
        return $target;
    }
      
    function show(callback) {
        var $target = $(this);
        var data = $(this).data('menusheet') || {};
        if (!data.shown) {
            var $source = $('#jqt .current:not(.menusheet)');
            $target.trigger('pageAnimationStart', {
                direction: 'in', animation: undefined, back: false
            });
            var closehandler = function() {
                $target.menusheet('hide');
                return false;
            };
    
            $source.one('webkitTransitionEnd', function() {
                $source.one('touchstart mousedown', closehandler);
                $source.removeClass('inmotion transition out');
                $target.removeClass('inmotion in');
                $target.trigger('pageAnimationEnd', {
                    direction: 'in', animation: undefined, back: false
                });
                !callback || callback.apply(this, arguments);
            });
    
            data.shown = true;
            data.closehandler = closehandler;
            data.source = $source;
            $(this).data('menusheet', data);
    
            $source.addClass('inmotion transition out');
            $target.addClass('current in');
            $('#jqt').addClass('menuopened');
        }
        return $target;
    }
    
    var methods = {
        init: function(options) {
            $(this).addClass('menusheet');
            $(this).data('menusheet', {shown: false});
        },
        show: show,
        hide: hide
    };
    
    $.fn.menusheet = function(method) {
      if (methods[method]) {
          if ($(this).is('.menusheet')) {
              return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
          } else {
              var msg = 'Target is not a `menusheet`. Action `' + method + '` is ignored.';
              console.warn(msg);
          }
      } else if ( typeof method === 'object' || ! method ) {
          return methods.init.apply(this, arguments);
      } else {
          $.error('Method "' + method + '" does not exist on jqt.menusheet' );
      }        
    };

    if ($.jQT) {
        $.jQT.addTapHandler({
            name: 'open-menusheet',
            isSupported: function(e, params) {
                return params.$el.is('.menu');
            },
            fn: function(e, params) {
                params.$el.removeClass('active');

                var $target = $(params.hash);
                $target.menusheet('show');

                return false;
            }
        });
        $.jQT.addTapHandler({
            name: 'follow-menulink',
            isSupported: function(e, params) {
                if ($('#jqt').hasClass('menuopened')) {
                    return params.$el.is('.menusheet a');
                }
                return false;
            },
            fn: function(e, params) {
                params.$el.removeClass('active');

                var $target = params.$el.closest('.menusheet');
                $target.menusheet('hide', function() {
                    if (!params.$el.is('.dismiss')) {
                      params.$el.trigger('tap');
                    }
                });
                return false;
            }
        });
    } else {
        console.error('Extension `jqt.menusheet` failed to load. jQT not found');
    }
})($);
