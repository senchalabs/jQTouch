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

jqt.iscroll.js - Daniel J. Pinter - DataZombies
An integration of jQT & iScroll 3.6

jQT page format

  <div id="jqt">
    <div id="ANY_ID" class="s-pane">
      <div class="toolbar">
        <h1>TITLE</h1>
      </div>
      <div id="ANY_ID-wrapper" class="s-scrollwrapper">
        <div id="ANY_ID-pane" class="s-scrollpane">
  
          <!-- your content -->
  
        </div>
      </div>
    </div>
  
    <!-- more pages -->
  
  </div>

The important parts are the s-pane class on the second div and the two inner
divs with s-scrollwrapper and s-scrollpane classes. The s-scrollwrapper and
s-scrollpane divs must have unique IDs. I got in the habbit of using the page ID
as the prefix for those unique IDs.

This script will auto-load iscroll-min.js as long as that file is in the same
directory as this script and it hasn't already been loaded. It will also 
auto-instantiate iScroll in the entire app.

To add iScroll to AJAX loaded pages use...

  </div>
  <script type="text/javascript" charset="utf-8">
  $(document).ready(function(){
    jQT.init_iScroll($('#long'));
  });
  </script>
  <div></div>

See ajax_long.html.

To resize a page after an event, like the ones in #events, use...

  jQT.setHeight();

See the swipe or tab functions in index.html.

Please note that jQT is the variable I used to instantiate jQTouch in...

  var jQT = new $.jQTouch({
    ...
  });

You can choose to use any variable you want. Just make sure to substitute that
variable name for jQT in the jqt.iscroll function calls.

*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function jqt_iscroll(jQT) {
      var setHeight, init_iScroll;

      $('.s-scrollwrapper').css('position', 'relative');
      $('.s-scrollwrapper').css('z-index', '1');

      // Begin setHeight()
      setHeight = function ($current_page) {
        var $navbar, navbarH, scroll, $tabbar, tabbarH, $toolbar, toolbarH, $wrapper;

        if (typeof $current_page === 'undefined' || $current_page === '') {
          $current_page = $('.current');
        }
        $current_page.each(function () {

          // Navigation Bar
          $navbar = $('.toolbar', this);
          navbarH = $navbar.length > 0 ? ($navbar.length > 0 ? $navbar.outerHeight() : 0) : 0;

          // Tool Bar (tabbar class) <the toolbar class is already being used by jQT>
          $toolbar = $('.tabbar', this);
          toolbarH = $toolbar.length > 0 ? ($toolbar.css('display') !== 'none' ? $toolbar.outerHeight() : 0) : 0;

          // Tab Bar (tabbar id)
          $tabbar = $('#tabbar');
          tabbarH = $tabbar.length > 0 ? ($tabbar.css('display') !== 'none' ? $tabbar.outerHeight() : 0) : 0;

          $wrapper = $('.s-scrollwrapper', this);
          $wrapper.height(parseInt(window.innerHeight - navbarH - toolbarH - tabbarH));
          $wrapper.css('margin-bottom', parseInt(toolbarH + tabbarH) + 'px');

          scroll = $(this).data('iscroll');
          if (typeof scroll !== 'null' && typeof scroll !== 'undefined') {
            setTimeout(function () {
              scroll.refresh();
            },
            0);
          }
        });
      };
      // End setHeight()

      // Begin init_iScroll()
      init_iScroll = function ($page) {
        if (typeof $page === 'undefined' || $page === '') {
          $page = $('#jqt > div, #jqt > form').has('.s-scrollpane');
        }
        $page.each(function () {
          var scroll = new iScroll($('.s-scrollpane', this).attr('id'), {
            hScrollbar: false,
            checkDOMChanges: true,
            desktopCompatibility: true,
            snap: false
          });
          $(this).data('iscroll', scroll);

          // Scroll to the top of the page when <h1> is touched
          $('.toolbar h1', this).click(function () {
            $('.current').data('iscroll').scrollTo(0, 0, 0);
          });

          // Resize on animation event
          $(this).bind('pageAnimationEnd', function (e, data) {
            if (data.direction === 'in') {
              jQT.setHeight();
            }
          });
        });

        // Resize on rotation
        $('#jqt').bind('turn', function (e, data) {
          jQT.setHeight();
        });

        jQT.setHeight();
      };
      // End init_iScroll()

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
            var i = path.indexOf('/jqt.iscroll.js');
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
            init_iScroll();
          });
        } else {
          init_iScroll();
        }
      })();
      // End loading iscroll-min.js

      return {
        init_iScroll: init_iScroll,
        setHeight: setHeight
      };

    });
  }
})(jQuery);