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
2010-12-30 As suggested by barts2108, you can refresh the tabbar by calling
refreshTabbar().

2010-12-23 Optimizaitons & code clean-up.

2010-12-16 2px #tabbar padding restored. Tab animations restored and limited to
fade, pop & slideup.

2010-12-13 Preventing navbar pull-down (thanks Aaron Mc Adam); Added 2px padding
inside #tabbar requested by @sennevdb; Added animations to tabs as requested by
barts2108. See note below.

2010-11-18  Chaged syntax on CSS section - Less code! Still works!;
Added a check for existing iScroll object in init_iScroll();
Added fixed-tab-width class code. Adding class="fixed-tab-width" and setting
#tabbar li, #tabbar td {width: <some value>em;} will prevent the tabs from being
resized EXCEPT if the tab width <= screen width / number of tabs. In that case
the tabs will be resized to fill the screen width.

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

--------------------------------------------------------------------------------
Tabbar Animations

Animations between tabs are marked-up in the anchor tag like so:
  <div id="tabbar">
    <div id="tabbar-pane">
      <ul>
        <li>
          <a href="#about" mask="bar_img/jqt.png" animation="slideup"> <!-- this line -->
            <strong>About</strong>
          </a>
        </li>
  ...

Only three jQT animations are supported (fade, pop & slideup). If an animation
is not recognized, like...
  animation="bugsBunny"
...then the default tab animation (none) will be used.

*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function bars(jQT) {

      var d = document, init_iScroll, initTabbar, initToolbar, refresh_iScroll, setBarWidth, setPageHeight, win = window;

      /*******************
       css section
       *******************/

      $('.s-scrollwrapper').css({
        'position': 'relative',
        'z-index': '1'
      });

      /*******************
       function section
       *******************/

      // Begin refresh_iScroll()
      refresh_iScroll = function (obj) {
        if (obj !== null && typeof (obj) !== 'undefined') {
          console.log('->scroll.refresh()');
          setTimeout(function () {
            obj.refresh();
          },
          0);
        }
      };
      // End refresh_iScroll()

      // Begin setBarWidth()
      setBarWidth = function ($bars) {
        var h = win.innerHeight + (jQT.getOrientation() === 'portrait' ? 20 : 0),
            w = win.innerWidth;

        console.log('\nBegin setBarWidth()');

        if ($bars === null || typeof ($bars) === 'undefined') {
          $bars = $('#tabbar, .tabbar');
        }

        $bars.each(function () {
          var $bar = $(this),
              $pane = $('> div', $bar),
              $tab_first = $bar.html().indexOf('ul') > -1 ? $('ul li:first-child', $bar) : $('table td:first-child', $bar),
              $tab_last = $bar.html().indexOf('ul') > -1 ? $('ul li:last-child', $bar) : $('table td:last-child', $bar),
              min_w1 = parseFloat($('li, td', $bar).css('min-width')),
              min_w2 = 1.05 * min_w1,
              numOfTabs = $('a', $bar).length,
              refresh_iscroll = false,
              scroll = $bar.data('iscroll'),
              tab_w = parseFloat($('li, td', $bar).css('width')),
              tabWidthIsPercentage;

          tabWidthIsPercentage = function () {
            var b = 0, c = 0, d = 0;

            $pane.width(w + 'px');
            $('table, ul', $pane).width($pane.width());
            $('li, td', $pane).each(function (a) {
              if (a + 1 === $('li, td', $pane).length) {
                c = w - d;
              } else {
                b = (w / numOfTabs) * (a + 1);
                c = ~~((w / numOfTabs) + ~~(b + 0.5) - ~~(b));
                d += c;
              }
              $(this).width(c + 'px');
            });
          };

          console.log('  ' + numOfTabs + ' tabs');
          // Fixed tab width
          if ($bar.hasClass('fixed-tab-width')) {

            // Tab width <= screen width / number of tabs :: override fixed width - no scrolling
            if (tab_w <= w / numOfTabs) {
              console.log('  Tab width <= screen width / number of tabs :: override fixed width - no scrolling');
              tabWidthIsPercentage();

            // Fixed tab width - scrolling
            } else {
              console.log('  Fixed tab width - scrolling');
              $pane.width(tab_w * numOfTabs + 'px');
              $('table, ul', $pane).width($pane.width());
              refresh_iscroll = true;
            }

          // Non-fixed tab width
          } else {

            // Tab width is a percentage of tabbar width - no scrolling
            if (min_w1 <= w / numOfTabs) {
              console.log('  Tab width is a percentage of tabbar width - no scrolling');
              tabWidthIsPercentage();

            // Tab width based on longest dimension - scrolling
            } else if (w / numOfTabs < min_w1 && min_w1 <= h / numOfTabs) {
              console.log('  Tab width based on longest dimension - scrolling');
              $pane.width(h + 'px');
              $('table, ul', $pane).width($pane.width());
              $('li, td', $pane).width(h / numOfTabs + 'px');
              refresh_iscroll = true;

            // Tab width is min-width + 5% - scrolling
            } else {
              console.log('  Tab width is min-width + 5% - scrolling');
              $pane.width(min_w2 * numOfTabs + 'px');
              $('table, ul', $pane).width($pane.width());
              $('li, td', $pane).width(min_w2 + 'px');
              refresh_iscroll = true;
            }
          }

          $tab_first.width($tab_first.width() - parseFloat($tab_first.css('margin-left'), 10));
          $tab_last.width($tab_last.width() - parseFloat($tab_last.css('margin-right'), 10));
            
          if (refresh_iscroll) {
            if (scroll === null || typeof (scroll) === 'undefined') {
              $bar.data('iscroll', new iScroll($pane.attr('id'), {
                bounceLock: true,
                desktopCompatibility: true,
                hScrollbar: false,
                vScrollbar: false
              }));
            }
            refresh_iScroll($bar.data('iscroll'));
          }
        });
        console.log('End setBarWidth()');
      };
      // End setBarWidth()

      // Begin setPageHeight()
      setPageHeight = function ($current_page) {
        console.log('\nBegin setPageHeight()');
        if ($current_page === null || typeof ($current_page) === 'undefined') {
          $current_page = $('.current');
        }
        $current_page.each(function () {
          var $navbar, navbarH, $tabbar, tabbarH, $toolbar, toolbarH, $wrapper;
          if ($('.s-scrollwrapper', this).length) {
            console.log('  #' + $current_page.attr('id'));

            // Navigation Bar
            $navbar = $('.toolbar', this);
            navbarH = $navbar.length > 0 ? ($navbar.length > 0 ? $navbar.outerHeight() : 0) : 0;

            // Tool Bar (tabbar class) <the toolbar class is already being used by jQT...see above>
            $toolbar = $('.tabbar', this);
            toolbarH = $toolbar.length > 0 ? ($toolbar.css('display') !== 'none' ? $toolbar.outerHeight() : 0) : 0;

            // Tab Bar (tabbar id)
            $tabbar = $('#tabbar');
            tabbarH = $tabbar.length > 0 ? ($tabbar.css('display') !== 'none' ? $tabbar.outerHeight() : 0) : 0;

            $wrapper = $('.s-scrollwrapper', this);
            $wrapper.height(win.innerHeight - navbarH - toolbarH - tabbarH + 'px');

            console.log('  window.innerHeight = ' + win.innerHeight + 'px');
            console.log('  navbarH = ' + navbarH + 'px');
            console.log('  toolbarH = ' + toolbarH + 'px');
            console.log('  tabbarH = ' + tabbarH + 'px');
            console.log('  $wrapper.height = ' + $wrapper.height() + 'px');

            refresh_iScroll($(this).data('iscroll'));
            console.log('End setPageHeight()');
          }
        });
      };
      // End setPageHeight()

      // Begin init_iScroll()
      init_iScroll = function ($page) {
        console.log('\nBegin init_iScroll()');
        if ($page === null || typeof ($page) === 'undefined') {
          $page = $('#jqt > div, #jqt > form').has('.s-scrollpane');
        }
        console.log('  Adding iScroll to:');
        $page.each(function () {
          var scroll = $(this).data('iscroll');
          if (scroll === null || typeof (scroll) === 'undefined') {
            console.log('    #' + this.id);
            scroll = new iScroll($('.s-scrollpane', this).attr('id'), {
              hScrollbar: false,
              desktopCompatibility: true
            });
            $(this).data('iscroll', scroll);
          }

          // Scroll to the top of the page when <h1> is touched
          $('.toolbar h1', this).click(function () {
            $('.current').data('iscroll').scrollTo(0, 0, 0);
          });

          // Prevent navbar pull-down
          $('.toolbar').bind('touchmove', function (e) {
            e.preventDefault();
            e.stopPropagation();
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

          // pad .s-scrollpane
          $('.s-scrollpane').css('padding-bottom', '1px');

          // Make sure that the tabbar is not visible while its being built
          $('#tabbar').hide();
          $('#tabbar-pane').height($('#tabbar').height());
          console.log('  #tabbar height = ' + $('#tabbar').height() + 'px');
          console.log('  #tabbar-pane height = ' + $('#tabbar-pane').height() + 'px');
          console.log('  #tabbar-pane <ul>/<table> height = ' + $('#tabbar-pane ul').height() + 'px');
          $('#tabbar a').each(function (index) {
            var $me = $(this);

            // Enummerate the tabbar anchor tags
            $me.attr('id', 'tabbar_' + index);

            // If this is the button for the page with the current class then enable it
            if ($me.attr('href') === firstPageID) {
              $me.addClass('enabled');
            }

            // Put page animation, if any, into data('animation')
            $me.data('animation', $me.attr('animation'));

            // Put href target into data('default_target') and void href
            if ($me.data('default_target') === null || typeof ($me.data('default_target')) === 'undefined') {
              $me.data('default_target', $me.attr('href'));
              $me.attr('href', 'javascript:void(0);');
            }

            // Create css masks from the anchor's mask property
            sheet.insertRule("a#tabbar_" + index + "::after, a#tabbar_" + index + "::before {-webkit-mask-image:url('" + $(this).attr('mask') + "')}", sheet.cssRules.length);

            // tabbar touches
            $(this).click(function () {
              var $me = $(this),
                animation,
                animations = ':fade:pop:slideup:',
                target;

              if (!$me.hasClass('enabled')) {
                animation = animations.indexOf(':' + $me.data('animation') + ':') > -1 ? $me.data('animation') : '';
                target = $me.data('default_target');

                jQT.goTo(target, animation);
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
                if (data.direction === 'in' && !$(this).hasClass('keep_tabbar') && !$(this).children().hasClass('keep_tabbar')) {
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
            if (scroll !== null && typeof (scroll) !== 'undefined') {
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
            getPath;

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
          //initToolbar()
        });
      })();
      // End loading iscroll-min.js

      return {
        init_iScroll: init_iScroll,
        refreshTabbar: initTabbar,
        setPageHeight: setPageHeight
      };

    });
  }
})(jQuery);