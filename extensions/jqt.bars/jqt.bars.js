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

      // Begin init_tabbar()
      init_tabbar = function () {
        if ($('#tabbar').length > 0) {

          // Find current class or 1st page in #jqt
          var firstPageID = '#' + ($('#jqt > .current').length === 0 ? $('#jqt > *:first') : $('#jqt > .current:first')).attr('id');

          // Make sure that the tabbar is not visible while its being built
          $('#tabbar').hide()

          // Set tabbar button width based on count
          if ($('#tabbar a').length <= 6 || ((/ipad/gi).test(navigator.appVersion) && $('#tabbar a').length <= 7)) {
            $('#tabbar td').css('width', 100 / $('#tabbar a').length + '%');
          } /* else {
            // If there's more buttons than allowed change tabbar to scrolling tabbar (TODO!)
            $('#tabbar table').css('width', 3.75 * $('#tabbar a').length + 'em');
            $('#tabbar td').css('width', '3.75em');
          } */

          $('#tabbar a').each(function (index) {

            // Enummerate the tabbar anchor tags
            $(this).attr('id', 'tabbar_' + index);

            // If this is the button for the page with the current class then enable it
            if ($(this).attr('href') === firstPageID) {
              $(this).addClass('enabled');
            }

            // Put href target into data('default_target') and void href
            $(this).data('default_target', $(this).attr('href'));
            $(this).attr('href', 'javascript:void(0);');

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

          // Hide tabbar when page has a form or any form element except when the page's parent div has the keep_tabbar class
          $('#jqt > div, #jqt > form').has('button,datalist,fieldset,form,input,keygen,label,legend,meter,optgroup,option,output,progress,select,textarea').each(function () {

            // Hide when in a form
            $(this).bind('pageAnimationEnd', function (e, data) {
              if (data.direction === 'in' && !$(this).hasClass('keep_tabbar')) {
                $('#tabbar').hide(function () {
                  jQT.setHeight();
                });
              }
            });
            // Show when starting to leave a form
            $(this).bind('pageAnimationStart', function (e, data) {
              if (data.direction === 'out') {
                $('#tabbar').show(function () {
                  jQT.setHeight();
                });
              }
            });
          });

          // Show tabbar now that it's been built
          $('#tabbar').show(function () {
            jQT.setHeight();
          });
        }
      };
      // End init_tabbar()

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
            init_tabbar();
          });
        } else {
          init_tabbar();
        }
      })();
      // End loading iscroll-min.js

    });
  }
})(jQuery);