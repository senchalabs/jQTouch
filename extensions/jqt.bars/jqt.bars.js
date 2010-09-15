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

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function bars(jQT) {

      var sheet = document.styleSheets[document.styleSheets.length - 1],
        init_tabbar, init_toolbar;

      // Begin loading iscroll-min.js
      (function () {
        var filename = 'iscroll-min.js',
          getPath, isLoaded, key = 'iScroll';

        // Begin isLoaded()
        isLoaded = function (key, filename) {
          return $('body').data(key) === filename ? true : false;
        };
        // End isLoaded()

        // Begin getPath()
        getPath = function () {
          var path;
          $('script').each(function () {
            path = $(this).attr('src');
            var i = path.indexOf('/jqt.bars.js');
            if (i > 0) {
              path = path.substring(0, path.lastIndexOf('/') + 1);
              return false;
            }
          });
          return path;
        };
        // End getPath()

        if (!isLoaded(key, filename)) {
          $.getScript(getPath() + filename, function () {
            $('body').data(key, filename);
            document.addEventListener('touchmove', function (e) {
              e.preventDefault();
            });
          });
        }
      })();
      // End loading iscroll-min.js

      init_tabbar = function () {

        // Make sure that the tabbar is not visible while its being built
        $('#tabbar').css('display: none;');

        $('#tabbar a').each(function (index) {

          // Put href='...' into data('default_target') and void href
          $(this).data('default_target', $(this).attr('href'));
          $(this).attr('href', 'javascript:void(0);');

          // Enummerate the tabbar anchor tags
          $(this).attr('id', 'tabbar_' + index);

          // Create css masks from the anchor's mask property
          sheet.insertRule("a#tabbar_" + index + "::after, a#tabbar_" + index + "::before {-webkit-mask-image:url('" + $(this).attr('mask') + "')}", sheet.cssRules.length);

          // tabbar touches
          $(this).click(function () {
            var $me = $(this),
              t;
            if (!$me.hasClass('enabled')) {
              t = $me.data('default_target');
              jQT.goTo(t);
              $('#tabbar a').each(function () {
                $(this).toggleClass('enabled', ($me.get(0) === $(this).get(0)));
              });
            }
          });
        });

        // Hide tabbar when page has a form or any form element
        $('#jqt > div, #jqt > form').has('button,datalist,fieldset,form,input,keygen,label,legend,meter,optgroup,option,output,progress,select,textarea').each(function () {
          $(this).bind('pageAnimationStart', function (e, data) {
            if (data.direction === 'out') {
              $('#tabbar').fadeIn('fast');
            }
          });
          $(this).bind('pageAnimationEnd', function (e, data) {
            if (data.direction === 'in' && !$(this).hasClass('keep_tabbar')) {
              $('#tabbar').fadeOut('fast', function () {
                jQT.setHeight();
              });
            }
          });
        });
        $('#tabbar').fadeIn('fast');
      };

      init_tabbar();

    });
  }
})(jQuery);