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

================================================================================
jqt.bars.js - Daniel J. Pinter - DataZombies

DataZombies@gmail.com
http://twitter.com/HeadDZombie
https://github.com/DataZombies/

Integration of iScroll into jQT with tabbar and toolbar implementations

Change Log
--------------------------------------------------------------------------------
2010-05-04 Added jQT.barsSettings.iscroll_lite (true|false). Set this to false
to use the full-featured version of iScroll.

2010-04-16 Optimized setPageHeight. Added jQT.barsSettings.phonegap. This, along
with typeof(PhoneGap) !== 'undefined' can be used to prepare app for PhoneGap. 

2011-03-20 Since portions of jqt.bars.js have to be rewritten for iScroll v4 I
decided to revamp the initilization process and get rid of some outstanding
issues.

Initialization
* All iScroll parameters are available to you. See the demo's UI page and the
  example below.
* The only class that is needed is 's-scrollwrapper'. If you want a different
  class on the scroll wrapper div change jQT.barsSettings.wrapperClass.
* The iScroll object is now attached to the scroll wrapper instead of the top of
  the page. This allows you to have multiple scrolling areas on a page.
* All areas on a page EXCEPT the scroll wrapper will not move.
* The initlization function is attached to the pageInserted event. You no longer
  have to add anything to dynamically loaded pages to enable scrolling or the
  tabbar

Bugs Squishes / Enhancements
* Scroll bar was not sized correctly in AJAX loaded pages. See the demo's
  AJAX > Long GET example.
* Padding the bottom of the scrolling area is now calculated. You don't have
  to add <div><br /><br /><br /></div> to the bottom of pages anymore.
* The calculation to determine the height of the scrolling wrapper is now
  dynamic. All areas on the page EXCEPT the scroll wrapper, i.e. 'fixed areas',
  are included in the calculation. If you have a div for segmented controls or
  other non-scrollable objects you no longer have to modify jqt.bars.js.

2011-03-06 iScroll v4

2011-03-01 First and last tab's margin now subtracted from the tab's calculated width.

2011-02-28 Added hide_tabbar class to prevent the tabbar in specific pages. Use
that class the same way that keep_tabbar is used.

2011-02-11 Android 2.2+ fix for -webkit-mask-image that don't show up for the
party. Added retina display support to tabbar.

2011-01-19 Two options added: debug & autoLoad_iScroll. Both are boolean values.
debug = true send messages to console.log(). autoLoad_iScroll = true finds this
script's path and loads iscroll-min.js. They can be set manually or programmatically
using jQT.barsSettings.

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
  <div id="ui" class="current">
    <div class="toolbar">
      <h1>UI Demos</h1>
    </div>
    <div class="s-scrollwrapper" momentum="false" vScrollbar="false">
      <div>
        ...a bunch of stuff...
      </div>
    </div>
  </div>
  ...more pages...
</div>

This script will auto-load iscroll-min.js as long as that file is in the same
directory as this script. It will also auto-instantiate iScroll for the entire app.

All iScroll parameters can be used by including them in the scroll wrapper div.
The above example turns momentum and vScrollbar off. See http://cubiq.org for
the current list.

To resize a page after an event, like the ones in #events, use...

  jQT.setPageHeight();

See the swipe or tab functions in index.html.

--------------------------------------------------------------------------------
Tabbar Animations

Animations between tabs are marked-up in the anchor tag like so:
<div id="tabbar">
  <div>
    <ul>
      <li>
        <a href="#about" mask="bar_img/jqt.png" mask2x="bar_img/jqt@2x.png" animation="slideup"> <!-- this line -->
          <strong>About</strong>
        </a>
      </li>
        ...more tabs...
    </ul>
  </div>
</div>

Only three jQT animations are supported (fade, pop & slideup). If an animation
is not recognized, like...
  animation="bugsBunny"
...then the default tab animation (none) will be used.

*/
(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function bars(jQT) {
      var animations = ':dissolve:fade:pop:slidedown:slideleft:slideright:slideup:',
          d = document,
          lastTime = 0,
          scrollerRulez = {
            'box-flex': '1.0',
            'height': 'auto',
            'padding-bottom': '1px !important',
            'width': '100%',
            'z-index': '1'
          },
          win = window,
          wrapperRulez = {
            'display': 'box',
            'position': 'absolute',
            'overflow': 'auto',
            'width': '100%',
            'z-index': '1'
          };

      jQT.barsReady = false;

      jQT.barsSettings = {
        autoLoad_iScroll: true,
        debug: false,
        iscroll_lite: true,
        phonegap: false,
        wrapperClass: 's-scrollwrapper'
      };

      // "Borrowing" jQT's _debug function
      function _debug(message) {
        var now = (new Date()).getTime(),
            delta = now - lastTime;
        lastTime = now;
        if (jQT.barsSettings.debug) {
          if (message) {
            console.log(delta + ': ' + message);
          } else {
            console.log(delta + ': Called ' + arguments.callee.caller.name);
          }
        }
      }

      // Begin refresh_iScroll()
      function refresh_iScroll(obj) {
        _debug();
        if (obj !== null && typeof(obj) !== 'undefined') {
          _debug('->scroll.refresh(' + obj.wrapper.id + ')');
          setTimeout(function () {
            obj.refresh();
          }, 0);
        }
      }
      // End refresh_iScroll()

      // Begin setBarWidth()
      function setBarWidth($bars) {
        var h = win.innerHeight + (jQT.getOrientation() === 'portrait' ? 20 : 0),
            w = win.innerWidth;

        _debug();
        if ($bars === null || typeof($bars) === 'undefined') {
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
              tabWidthIsPercentage = function () {
                var b = 0,
                    c = 0,
                    d = 0;

                $pane.width(w + 'px');
                $('table, ul', $pane).width($pane.width());
                $('li, td', $pane).each(function (a) {
                  if (a + 1 === $('li, td', $pane).length) {
                    c = w - d;
                  } else {
                    b = (w / numOfTabs) * (a + 1);
                    c = ~~ ((w / numOfTabs) + ~~ (b + 0.5) - ~~ (b));
                    d += c;
                  }
                  $(this).width(c + 'px');
                });
              };

          _debug();
          _debug('  ' + numOfTabs + ' tabs');
          $bar.css({'display': 'box'});
          // Fixed tab width
          if ($bar.hasClass('fixed-tab-width')) {

            // Tab width <= screen width / number of tabs :: override fixed width - no scrolling
            if (tab_w <= w / numOfTabs) {
              _debug('  Tab width <= screen width / number of tabs :: override fixed width - no scrolling');
              tabWidthIsPercentage();

              // Fixed tab width - scrolling
            } else {
              _debug('  Fixed tab width - scrolling');
              $pane.width(tab_w * numOfTabs + 'px');
              $('table, ul', $pane).width($pane.width());
              refresh_iscroll = true;
            }
          } else {
            // Non-fixed tab width
            // Tab width is a percentage of tabbar width - no scrolling
            if (min_w1 <= w / numOfTabs) {
              _debug('  Tab width is a percentage of tabbar width - no scrolling');
              tabWidthIsPercentage();

              // Tab width based on longest dimension - scrolling
            } else if (w / numOfTabs < min_w1 && min_w1 <= h / numOfTabs) {
              _debug('  Tab width based on longest dimension - scrolling');
              $pane.width(h + 'px');
              $('table, ul', $pane).width($pane.width());
              $('li, td', $pane).width(h / numOfTabs + 'px');
              refresh_iscroll = true;

              // Tab width is min-width + 5% - scrolling
            } else {
              _debug('  Tab width is min-width + 5% - scrolling');
              $pane.width(min_w2 * numOfTabs + 'px');
              $('table, ul', $pane).width($pane.width());
              $('li, td', $pane).width(min_w2 + 'px');
              refresh_iscroll = true;
            }
          }

          $tab_first.width(parseFloat($tab_first.css('width')) - parseFloat($tab_first.css('margin-left')) + 'px');
          $tab_last.width(parseFloat($tab_last.css('width')) - parseFloat($tab_last.css('margin-right')) + 'px');

          if (refresh_iscroll) {
            if (scroll === null || typeof(scroll) === 'undefined') {
              $bar.data('iscroll', new iScroll($bar.attr('id'), {
                bounceLock: true,
                desktopCompatibility: true,
                hScrollbar: false,
                vScrollbar: false
              }));
            }
            refresh_iScroll($bar.data('iscroll'));
            _debug('Refresh done.');
          }
        });
      }
      // End setBarWidth()

      // Begin setPageHeight()
      function setPageHeight($current_page) {
        var fixed = 0,
            pGapAdjustment = (typeof(PhoneGap) !== 'undefined' && jQT.barsSettings.phonegap ? 20: 0),
            $tabbar, tabbarH, $toolbar, toolbarH;

        _debug();
        if ($current_page === null || typeof($current_page) === 'undefined') {
          $current_page = $('.current');
        }

        // Caclulate the fixed  divs' height (fixed divs are everything on the page EXCEPT the scroll wrapper)
        $(' > *', $current_page).not('.' + jQT.barsSettings.wrapperClass + ', .listIndex').each(function () {
          fixed += $(this).outerHeight();
        });

        // Tool Bar (tabbar class) <the toolbar class is already being used by jQT>
        $toolbar = $('.tabbar', $current_page);
        toolbarH = $toolbar.length > 0 ? ($toolbar.css('display') !== 'none' ? $toolbar.outerHeight() : 0) : 0;

        // Tab Bar (tabbar id)
        $tabbar = $('#tabbar');
        tabbarH = $tabbar.length > 0 ? ($tabbar.css('display') !== 'none' ? $tabbar.outerHeight() : 0) : 0;

        $('.' + jQT.barsSettings.wrapperClass, $current_page).each(function () {
          var $wrapper = $(this),
              $pane = $('div:first', $wrapper),
              pane = $wrapper.children().get(0),
              getLast = function (node, i) {
                var lastNode, lastNodeIndex = node.childNodes.length - 1,
                    lNStyle;

                for (lastNodeIndex; lastNodeIndex >= 0; --lastNodeIndex) {
                  lastNode = node.childNodes[lastNodeIndex];
                  if (lastNode.nodeType === 1) {
                    if (typeof(lastNode.style) !== 'undefined') {
                      lNStyle = window.getComputedStyle(lastNode, '');
                      if (lNStyle.display !== 'none' && lNStyle.visibility !== 'hidden' && lNStyle.height !== '0px') {
                        i = (parseFloat(lNStyle.lineHeight, 10) || 0) + (parseFloat(lNStyle.paddingBottom, 10) || 0);
                        break;
                      }
                    }
                  }
                }
                if (lastNode.childNodes.length) {
                  i = getLast(lastNode, i);
                } 
                return i;
              };

          if ($wrapper.is(':visible')) {
            _debug(' #' + $(this).attr('id'));

            $wrapper.height(win.innerHeight - fixed - toolbarH - tabbarH - pGapAdjustment + 'px');
            $wrapper.css({'min-height': win.innerHeight - fixed - toolbarH - tabbarH - pGapAdjustment + 'px'});
            $pane.css('padding-bottom', getLast(pane, 0) + 'px !important');

            _debug(' window.innerHeight .... ' + win.innerHeight + 'px');
            _debug(' fixed ............... - ' + fixed + 'px');
            _debug(' toolbarH ............ - ' + toolbarH + 'px');
            _debug(' tabbarH ............. - ' + tabbarH + 'px');
            _debug(' $wrapper.height ..... = ' + $wrapper.height() + 'px');
            _debug(' $pane.padding-bottom .. ' + $pane.css('padding-bottom'));

            refresh_iScroll($wrapper.data('iscroll'));
            _debug('Refresh done.');
          }
        });
      }
      // End setPageHeight()

      // Begin initTabbar()
      function initTabbar() {
        _debug();
        if ($('#tabbar').length) {
          _debug('  #tabbar exists');

          // Find current class or 1st page in #jqt & the last stylesheet
          var firstPageID = '#' + ($('#jqt > .current').length === 0 ? $('#jqt > *:first') : $('#jqt > .current:first')).attr('id'),
              sheet = d.styleSheets[d.styleSheets.length - 1];

          // Make sure that the tabbar is not visible while its being built
          $('#tabbar').hide();
          $('#tabbar div:first').height($('#tabbar').height());
          _debug('  #tabbar height = ' + $('#tabbar').height() + 'px');
          $('#tabbar a').each(function (index) {
            var $me = $(this),
                defaultTarget = $me.data('defaultTarget'),
                mask2x = $(this).attr('mask2x'),
                tabIcon, tabZoom;

            // PhoneGap integration
            if (typeof(PhoneGap) !== 'undefined' && jQT.barsSettings.phonegap) {
              $('body > #tabbar').css({bottom: '20px !important'});
            }

            // Enummerate the tabbar anchor tags
            $me.attr('id', 'tab_' + index);

            // If this is the button for the page with the current class then enable it
            if ($me.attr('href') === firstPageID) {
              $me.addClass('enabled');
            }

            // Put page animation, if any, into data('animation')
            $me.data('animation', $me.attr('animation'));

            // Put href target into data('defaultTarget') and void href
            if (defaultTarget === null || typeof(defaultTarget) === 'undefined') {
              $me.data('defaultTarget', $me.attr('href'));
              $me.attr('href', 'javascript:void(0);');
            }

            // Create css masks from the anchor's mask property
            tabIcon = $(this).attr('mask');
            tabZoom = 1;
            if (window.devicePixelRatio && window.devicePixelRatio === 2 && typeof(mask2x) !== 'undefined') {
              tabIcon = $(this).attr('mask2x');
              tabZoom = 0.5;
            }
            sheet.insertRule('a#tab_' + index + '::after, a#tab_' + index + '::before {-webkit-mask-image:url(\'' + tabIcon + '\');' + ' zoom: ' + tabZoom + ';}', sheet.cssRules.length);

            // tabbar touches
            $me.click(function () {
              var $referrerTab = $('#tabbar .enabled'),
                  $tabs = $('#tabbar a'),
                  $targetTab = $(this),
                  animation = animations.indexOf(':' + $me.data('animation') + ':') > -1 ? $me.data('animation') : '', 
                  i,
                  referrerAnimation = animations.indexOf(':' + $referrerTab.data('animation') + ':') > -1 ? $referrerTab.data('animation') : '',
                  referrerPage = $referrerTab.data('defaultTarget'),
                  target = $me.data('defaultTarget'),
                  targetAnimation = animations.indexOf(':' + $targetTab.data('animation') + ':') > -1 ? $targetTab.data('animation') : '',
                  targetHist = $targetTab.data('hist'),
                  targetPage = $targetTab.data('defaultTarget'),
                  thisTab, 
                  TARDIS = function(anime) {
                    var DW;
                    if (anime.indexOf('left') > 0) {
                      DW = anime.replace(/left/, 'right');
                    } else if (anime.indexOf('right') > 0) {
                      DW = anime.replace(/right/, 'left');
                    } else if (anime.indexOf('up') > 0) {
                       DW = anime.replace(/up/, 'down');
                    } else if (anime.indexOf('down') > 0) {
                      DW = anime.replace(/down/, 'up');
                    } else {
                      DW = anime;
                    }
                    return DW;
                  };

              if (!$targetTab.hasClass('enabled')) {
                for (i = $('#tabbar a').length - 1; i >= 0; --i) {
                  thisTab = $tabs.eq(i);
                  thisTab.toggleClass('enabled', ($targetTab.get(0) === thisTab.get(0)));
                  if ($targetTab.get(0) === thisTab.get(0)) {
                    jQT.goTo(target, (targetAnimation === '' ? TARDIS(referrerAnimation) : targetAnimation));
                    _debug('tabbbar touch, new tab');
                    setPageHeight();
                  }
                }
              } else {
                jQT.goTo(target);
                _debug('tabbar touch, same tab');
                setPageHeight();
              }
            });
          });

          // Hide tabbar when page has a form or any form element or .hide_tabbar class except when the page's parent div has the .keep_tabbar class.
          // Show tabbar when leaving a form or .hide_tabbar page except when going into a page with a form or .hide_tabbar class
          $('#jqt > div, #jqt > form').each(function () {
            $(this).bind('pageAnimationStart', function (e, data) {
              var $target = $(e.target),
                  isForm = function ($page) {
                    return $page.has('button, datalist, fieldset, form, keygen, label, legend, meter, optgroup, option, output, progress, select, textarea').length > 0 && !($(':input', $page).length !== $(':input:hidden', $page).length);
                  },
                  isHide = function ($page) {
                    return $page.hasClass('hide_tabbar') || $page.children().hasClass('hide_tabbar');
                  },
                  isKeep = function ($page) {
                    return $page.hasClass('keep_tabbar') || $page.children().hasClass('keep_tabbar');
                  };

              if (data.direction === 'in') {
                if ((!isForm($target) && !isHide($target)) || isKeep($target)) {
                  $('#tabbar').show(function () {
                    _debug('Show tabbar');
                    setPageHeight();
                  });
                } else {
                  $('#tabbar').hide(function () {
                    _debug('Hide tabbar');
                    setPageHeight();
                  });
                }
              }
            });
          });

          // Resize tabbar & scroll to enabled tab on rotation
          $('#jqt').bind('turn', function (e, data) {
            var $tabbar = $('#tabbar'),
                scroll = $tabbar.data('iscroll');
            if (scroll !== null && typeof(scroll) !== 'undefined') {
              setTimeout(function () {
                $tabbar.width = win.innerWidth;
                if ($('.enabled').offset().left + $('.enabled').width() >= win.innerWidth) {
                  scroll.scrollToElement('#' + $('.enabled').attr('id'), 0);
                }
              }, 0);
            }
          });

          // Show tabbar now that it's been built, maybe
          if (!$('.current').hasClass('hide_tabbar')) {
            $('#tabbar').show(function () {
              _debug('initTabbar hide tabbar');
              setPageHeight();
              setBarWidth();
            });
          } else {
            _debug('initTabbar show tabbar');
            setPageHeight();
            setBarWidth();
          }
        }
      }
      // End initTabbar()

      // Begin init_iScroll()
      function init_iScroll(page) {
        var $wrappers, pageID;

        if (page[0].nodeType === 1) {
          pageID = page.attr('id');
          $wrappers = $('.' + jQT.barsSettings.wrapperClass, page);

          _debug();
          _debug('  #' + pageID + ' nodeType: ' + page[0].nodeType);
          $wrappers.each(function (index) {
            var $this = $(this),
                i, iscroll, scroll = $this.data('iscroll'),
                scrollID = $this.attr('id') || pageID + '_wrapper_' + index;

            $this.css(wrapperRulez);
            $('div:first', this).css(scrollerRulez);

            $this.attr('id', scrollID);
            if (typeof(scroll) === 'undefined' || scroll === null) {
              iscroll = new iScroll(scrollID, {
                desktopCompatibility: true
              });
              for (i in iscroll.options) {
                if (iscroll.options.hasOwnProperty(i)) {
                  if (typeof($this.attr(i)) !== 'undefined') {
                    iscroll.options[i] = $this.attr(i).toLowerCase() === 'true' ? true : false;
                  }
                }
              }
              $this.data('iscroll', iscroll);
              if ($('#' + pageID).hasClass('current')) {
                _debug('init_iScroll');
                setPageHeight($('#' + pageID));
              }
            }
          });

          // Prevent navbar pull-down
          $('#' + pageID + ' .toolbar ~ div').andSelf().not('.' + jQT.barsSettings.wrapperClass + ', .listIndex').bind('touchmove', function (e) {
            e.preventDefault();
            e.stopPropagation();
          });

          // Resize on animation event
          page.bind('pageAnimationEnd', function (e, data) {
            if (data.direction === 'in') {
              _debug('pageAnimationEnd: In: ' + $(this).attr('id'));
              setPageHeight($(this));
            }
          });

          // Scroll to the top of the page when <h1> is touched
          $('.toolbar h1', '#' + pageID).click(function () {
            var $wrappers = $(this).parents('#jqt > *').children('.' + jQT.barsSettings.wrapperClass);
            $wrappers.each(function () {
              if ($(this).is(':visible')) {
                $(this).data('iscroll').scrollTo(0, 0, 0);
              }
            });
          });
        }
      }
      // End init_iScroll()

      // Begin loading iscroll & initialization
      $(document).ready(function () {

        // Begin getPath()
        function getPath() {
          var path;
          _debug();
          $('script').each(function () {
            var i;
            path = $(this).attr('src');
            if (path) {
              i = path.indexOf('/jqt.bars.js');
              if (i > 0) {
                path = path.substring(0, path.lastIndexOf('/') + 1);
                return false;
              }
            }
          });
          return path;
        }
        // End getPath()

        // Begin initializations
        function initializations() {
          jQT.barsReady = false;

          $('#jqt > *').each(function () {
            init_iScroll($(this));
          });
          initTabbar();
          //initToolbar();

          // Resize on rotation
          $('#jqt').bind('turn', function (e, data) {
            _debug('Rotation');
            setPageHeight();
            setBarWidth();
          });

          jQT.barsReady = true;

          // Bind intialization to pageInserted event
          $(document.body).bind('pageInserted', function (e, data) {
            if (typeof (data.page[0].innerHTML) !== 'undefined') {
              jQT.barsReady = false;
              init_iScroll(data.page);
              jQT.barsReady = true;
            }
          });
        }
        // End initializatons

        if (jQT.barsSettings.autoLoad_iScroll) {
          var filename = jQT.barsSettings.iscroll_lite ? 'iscroll-lite-min.js' : 'iscroll-min.js';
          _debug('Begin loading ' + filename);
          $.getScript(getPath() + filename, function () {
            initializations();
          });
        } else {
          initializations();
        }
      });
      // End loading iscroll & initialization

      return {
        refresh_iScroll: refresh_iScroll,
        refreshTabbar: initTabbar,
        setPageHeight: setPageHeight
      };
    });
  }
})(jQuery);
/*jslint onevar: true, undef: true, regexp: true, devel: true, maxerr: 50, indent: 0 */
/*global document, window, console, setTimeout, iScroll, jQuery */