/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>

    (c) 2012 by jQTouch project members.
    See LICENSE.txt for license.

    Author: Thomas Yip
*/

/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>

    (c) 2012 by jQTouch project members.
    See LICENSE.txt for license.

    Author: Thomas Yip
*/

(function($) {
    var src = $("head script").last().attr("src") || '';
    var scriptpath = src.split('?')[0].split('/').slice(0, -1).join('/')+'/';
    var csspath = scriptpath + 'jqt.actionsheet.css';
    var link = $('<link href="' + csspath + '" rel="stylesheet">');
    $('head').append($(link));

    function hide(callback) {
        var $target = $(this);
        var data = $(this).data('actionsheet');
        var $source = data.source;

        var timeout;

        function cleanup() {
          clearTimeout(timeout);

          $source.removeClass('transition');
          $target.removeClass('inmotion transition');
          !callback || callback.apply(this, arguments);
        };
        timeout = setTimeout(cleanup, 500);

        if (data.shown) {
            $(this).data('actionsheet', {});
            $target.one('webkitTransitionEnd', cleanup);
    
            $source.addClass('transition');
            $target.removeClass('current').addClass('inmotion transition');
            $('#jqt').removeClass('actionopened');
        }
        return $target;
    }
      
    function show(callback) {
        var $target = $(this);
        var data = $(this).data('actionsheet') || {};
        if (!data.shown) {
            var $source = $('#jqt .current:not(.actionsheet)');
    
            $target.one('webkitTransitionEnd', function() {
                $source.removeClass('transition');
                $target.removeClass('inmotion transition');
                !callback || callback.apply(this, arguments);
            });
    
            data.shown = true;
            data.source = $source;
            $(this).data('actionsheet', data);

            $source.addClass('transition');
            $target.addClass('inmotion transition');
            $('#jqt').addClass('actionopened');
            setTimeout(function() {
                $target.addClass('current');
            }, 50);
        }
        return $target;
    }
    
    var methods = {
        init: function(options) {
            $(this).addClass('actionsheet');
            $(this).data({shown: false});
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
          $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
      }        
    };

    if ($.jQTouch) {
        $.jQTouch.addTapHandler({
            name: 'open-actionsheet',
            isSupported: function(e, params) {
                return params.$el.is('.action');
            },
            fn: function(e, params) {
                params.$el.removeClass('active');

                var $target = $(params.hash);
                $target.actionsheet('show');

                return false;
            }
        });
        $.jQTouch.addTapHandler({
            name: 'follow-actionlink',
            isSupported: function(e, params) {
                if ($('#jqt').hasClass('actionopened')) {
                    return params.$el.is('.actionsheet a');
                }
                return false;
            },
            fn: function(e, params) {
                params.$el.removeClass('active');

                var $target = params.$el.closest('.actionsheet');
                $target.actionsheet('hide', function() {
                    if (!params.$el.is('.dismiss')) {
                      params.$el.trigger('tap');
                    }
                });
                return false;
            }
        });
    } else {
        console.error('Extension `jqt.actionsheet` failed to load. jQT not found');
    }
})($);
