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

=======
jqt.bars.js - Daniel J. Pinter - DataZombies

Integration of iScroll into jQT with tab bar and tool bar implementations

Change Log
--------------------------------------------------------------------------------
2010-10-05  Really fixed the "Non-iScroll page not scrolling". jqt.bars used
e.preventDefault() as per iScroll directions. This is already used in jQT,
causing a conflict. e.preventDefault() has been removed from jqt.bars.

2010-10-04  "Non-iScroll page not scrolling" fix.

2010-10-02  Horizontal scrolling tabbar! Merged jqt.iscroll into jqt.bars.
Table & UL tabbar example. More tabbar css tweaking.

2010-09-19  Changes made to automate tabbar creation. On launch jqt.bars resizes
the tabbar. If there are 6 or less iPhone tabs, 7 or less for iPad tabs, they
are distributed evenly across the tabbar. Code for 7 or more iPhone, 8 or more
iPad, tabs is commented out because I'm working towards a scrolling tabbar.
jqt.bars then looks for the first occurrence of .current (uses 1st page if not
found) and enables the tab for that page.

2010-09-14  Abstracted tabbar code into extension jqt.bars.js.
iScroll Integration

2010-09-08  Squished tabbar icon border bug; replaced more.png; laid groundwork
for horizontally-scrolling tabbar; updated iPhone sizing guidelines in tabbar.css;
replaced "$header" and "headerH" in jqt.iscroll.js with "$navbar" and "navbarH"
to match the iOS HIG.


2010-09-05  Abstracted jQT-iScroll code & styles to
/extensions/jqt.iscroll/jqt.iscroll.js. Added scroll to top when the header is
touched. Updated ajax_long.html and ajax_post.php. Added iscroll-min.js.
Dynamically load iscroll.js (or iscroll-min.js). Thanks to BeeDesk for inspiration.

--------------------------------------------------------------------------------

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
directory as this script. It will also auto-instantiate iScroll for the entire app.

To add iScroll to AJAX loaded pages use this at the bottom of the file...

  </div>
  <script type="text/javascript" charset="utf-8">
  $(document).ready(function(){
    jQT.init_iScroll($('#long'));
  });
  </script>
  <div></div>

See ajax_long.html.

To resize a page after an event, like the ones in #events, use...

  jQT.setPageHeight();

See the swipe or tab functions in index.html.

Please note that jQT is the variable I used to instantiate jQTouch in...

  var jQT = new $.jQTouch({
    ...
  });

You can choose to use any variable you want. Just make sure to substitute that
variable name for "jQT" in the jqt.bars function calls.

*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function bars(jQT) {

      var d = document,
        init_iScroll, initTabbar, initToolbar, refresh_iScroll, setBarWidth, setPageHeight, win = window;
      /*******************
       css section
       *******************/
      $('.s-scrollwrapper').css('position', 'relative');
      $('.s-scrollwrapper').css('z-index', '1');

      /*******************
       function section
       *******************/
      // Begin refresh_iScroll()
      refresh_iScroll = function (obj) {
        if (obj !== null && typeof obj !== 'undefined') {
console.log('->scroll.refresh()');
            setTimeout(function () {
              obj.refresh();
            },
            0);
        }
      }
      // End refresh_iScroll()

      // Begin setBarWidth()
      setBarWidth = function ($bars) {
console.log('\nBegin setBarWidth()');

        var h = parseInt(win.innerHeight > win.innerWidth ? win.innerHeight : win.innerWidth, 10),
          w = parseInt(win.innerWidth < win.innerHeight ? win.innerWidth : win.innerHeight, 10);
        if (jQT.getOrientation() === 'portrait') {
          h += 20;
        } else {
          w += 20;
        }

        if ($bars === null || typeof $bars === 'undefined') {
          $bars = $('#tabbar, .tabbar');
        }

        $bars.each(function () {
          var min_w1 = parseFloat($('li, td', this).css('min-width')),
            min_w2 = 1.05 * min_w1,
            numOfTabs = $('a', this).length,
            $pane = $('> div', this),
            scroll = $(this).data('iscroll');

console.log('  ' + numOfTabs + ' tabs');
          if (min_w1 <= w / numOfTabs) {
          // Tab width is a percentage of tabbar - no scrolling
console.log('  Percentage: fixed');
            $pane.width('100%');
            $('table, ul', $pane).width($pane.width());
            $('li, td', $pane).width(100 / numOfTabs + '%');
          } else if (w / numOfTabs < min_w1 && min_w1 <= h / numOfTabs) {
          // Tab width based on longest dimension - scrolling
console.log('  Longest dimension: scrolling');
            $pane.width(h + 'px');
            $('table, ul', $pane).width($pane.width());
            $('li, td', $pane).width(h / numOfTabs + 'px');
          } else {
          // Tab width is min-width + 5% - scrolling
console.log('  min-width + 5%: scrolling');
            $pane.width(min_w2 * numOfTabs + 'px');
            $('table, ul', $pane).width($pane.width());
            $('li, td', $pane).width(min_w2 + 'px');
          }
          if (min_w1 > w / numOfTabs) {
            if (scroll === null || typeof scroll === 'undefined') {
              $(this).data('iscroll', new iScroll($pane.attr('id'), {
                bounceLock: true,
                desktopCompatibility: true,
                hScrollbar: false,
                vScrollbar: false
              }));
            }
            refresh_iScroll($(this).data('iscroll'));
          }
        });
console.log('End setBarWidth()');
      };
      // End setBarWidth()

      // Begin setPageHeight()
      setPageHeight = function ($current_page) {
console.log('\nBegin setPageHeight()');
        if ($current_page === null || typeof $current_page === 'undefined') {
          $current_page = $('.current');
        }
        $current_page.each(function () {
          var $navbar, navbarH, scroll, $tabbar, tabbarH, $toolbar, toolbarH, $wrapper;
          if ($('.s-scrollwrapper', this).length) {
console.log('  #' + $current_page.attr('id'));

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
            $wrapper.height(parseInt(win.innerHeight - navbarH - toolbarH - tabbarH, 10));
            $wrapper.css('margin-bottom', parseInt(toolbarH + tabbarH, 10) + 'px');
console.log('  window.innerHeight = ' + win.innerHeight);
console.log('  navbarH = ' + navbarH);
console.log('  toolbarH = ' + toolbarH);
console.log('  tabbarH = ' + tabbarH);
console.log('  $wrapper.height = ' + $wrapper.height());
console.log('  $wrapper.css(\'margin-bottom\') = ' + $wrapper.css('margin-bottom'));

            refresh_iScroll($(this).data('iscroll'));
console.log('End setPageHeight()');
          }
        });
      };
      // End setPageHeight()

      // Begin init_iScroll()
      init_iScroll = function ($page) {
console.log('\nBegin init_iScroll()');
        if ($page === null || typeof $page === 'undefined') {
          $page = $('#jqt > div, #jqt > form').has('.s-scrollpane');
        }
console.log('  Adding iScroll to:');
        $page.each(function () {
console.log('    #' + this.id);
          var scroll = new iScroll($('.s-scrollpane', this).attr('id'), {
            hScrollbar: false,
            desktopCompatibility: true
          });
          $(this).data('iscroll', scroll);

          // Scroll to the top of the page when <h1> is touched
          $('.toolbar h1', this).click(function () {
            $('.current').data('iscroll').scrollTo(0, 0, 0);
          });

          // Resize on animation event
          $(this).bind('pageAnimationEnd', function (e, data) {
            if (data.direction === 'in') {
console.log('\npageAnimationEnd: In');
              setPageHeight();
            }
          });
        });

        // Resize on rotation
        $('#jqt').bind('turn', function (e, data) {
console.log('\nRotation');
          setPageHeight();
          setBarWidth();
        });

        if (!$('#tabbar').length) {
          setPageHeight();
        }
console.log('End init_iScroll()');
      };
      // End init_iScroll()

      // Begin initTabbar()
      initTabbar = function () {
console.log('\nBegin initTabbar()');
        if ($('#tabbar').length > 0) {
console.log('  #tabbar exists');

          // Find current class or 1st page in #jqt & the last stylesheet
          var firstPageID = '#' + ($('#jqt > .current').length === 0 ? $('#jqt > *:first') : $('#jqt > .current:first')).attr('id'),
            sheet = d.styleSheets[d.styleSheets.length - 1];

          // Make sure that the tabbar is not visible while its being built
          $('#tabbar').hide();
          $('#tabbar-pane').height($('#tabbar').height());
console.log('  #tabbar height = ' + $('#tabbar').height());
console.log('  #tabbar-pane height = ' + $('#tabbar-pane').height());
console.log('  #tabbar-pane <ul> height = ' + $('#tabbar-pane ul').height());
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
          $('#jqt > div, #jqt > form').has('button, datalist, fieldset, form, keygen, label, legend, meter, optgroup, option, output, progress, select, textarea').each(function () {

            // Hide when in a form
            $(this).bind('pageAnimationEnd', function (e, data) {
              if ($(':input', this).length !== $(':input:hidden', this).length) {
                if (data.direction === 'in' && !$(this).hasClass('keep_tabbar')) {
                  $('#tabbar').hide(function () {
console.log('\nHide tabbar');
                    setPageHeight();
                  });
                }
              }
            });

            // Show when starting to leave a form
            $(this).bind('pageAnimationStart', function (e, data) {
              if (data.direction === 'out' && $('#tabbar:hidden').length) {
                $('#tabbar').show(function () {
console.log('\nShow tabbar');
                  setPageHeight();
                });
              }
            });
          });

          // Scroll to enabled tab on rotation
          $('#jqt').bind('turn', function (e, data) {
            var scroll = $('#tabbar').data('iscroll');
            if (scroll !== null && typeof scroll !== 'undefined') {
              setTimeout(function () {
                if ($('.enabled').offset().left + $('.enabled').width() >= win.innerWidth) {
                  scroll.scrollToElement('#' + $('.enabled').attr('id'), '0ms');
                }
              },
              0);
            }
          });

          // Show tabbar now that it's been built
          $('#tabbar').show(function () {
            setPageHeight();
            setBarWidth();
          });
        }
console.log('End initTabbar()');
      };
      // End initTabbar()

      // Begin loading iscroll-min.js
      (function () {
console.log('Begin loading iScroll');
        var filename = 'iscroll-min.js',
          getPath, key = 'iScroll';

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
        $.getScript(getPath() + filename, function () {
console.log('End loading iScroll');
          init_iScroll();
          initTabbar();
//          initToolbar()
        });
      })();
      // End loading iscroll-min.js

      return {
        init_iScroll: init_iScroll,
        setPageHeight: setPageHeight
      };

    });
  }
})(jQuery);