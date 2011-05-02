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
jqt.listIndex.js - Daniel J. Pinter - DataZombies

DataZombies@gmail.com
http://twitter.com/HeadDZombie
https://github.com/DataZombies/

Implementation of the cubiq.org's list index for jQT.

Change Log
--------------------------------------------------------------------------------
2011-03-20 - 1st production version
--------------------------------------------------------------------------------
Dependencies - jqt.bars.js

Add the 'indexed' class to any element on a page wth a <ul><li>...</li></ul>
list you want to add a list index to. The index is automaticall build and
attached to that page. Any dynamically loaded page with the indexed class on the
page's top div will also automatically get a listIndex.

The listIndex's class is 'listIndex' if you want to add your own styles.

Settings:
jQT.listIndexSettings.index: An array that contains the alphabetic charcters
used to build the index.
jQT.listIndexSettings.listSeperatorClass: The class name that is used in the
list for the seperators. In this example the listSeperatorCLass is 'sep'.

<!-- UI - Edge -->
 <div id="edge">
   <div class="toolbar">
     <h1></h1>
     <a href="#" class="back"></a>
   </div>
   <div class="s-scrollwrapper indexed">
     <div>
       <ul class="edgetoedge">
         <li class="sep">F</li>
         <li><a href="#">Flintstone, <em>Fred</em></a></li>
         <li><a href="#">Flintstone, <em>Pebble</em></a></li>
         <li><a href="#">Flintstone, <em>Wilma</em></a></li>
         <li class="sep">J</li>
         <li><a href="#">Jetson, <em>Elroy</em></a></li>
         <li><a href="#">Jetson, <em>George</em></a></li>
         <li><a href="#">Jetson, <em>Jane</em></a></li>
         <li><a href="#">Jetson, <em>Judy</em></a></li>
         <li class="sep">R</li>
         <li><a href="#">Rubble, <em>Bambam</em></a></li>
         <li><a href="#">Rubble, <em>Barney</em></a></li>
         <li><a href="#">Rubble, <em>Betty</em></a></li>
       </ul>
     </div>
   </div>
 </div>

To manually instantate a listIndex do one of the following:

//multiple pages
$(document).ready(function () {
  initListIndices();
});

//single page
$(document).ready(function () {
  initListIndex('bigList');
});

*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function listIndex(jQT) {
      var device, ListIndex;

      jQT.listIndexSettings = {
        index: ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        listSeperatorClass: 'sep'
      };

      ListIndex = function ($page) {
        var buildIndex = function ($page) {
          var h = window.innerHeight,
              i = jQT.listIndexSettings.index.length - 1,
              pageID = $page.attr('id'),
              pageIndex = '',
              w = window.innerWidth;

          $wrapper = $('.' + jQT.barsSettings.wrapperClass, '#' + pageID);

          $('.' + jQT.listIndexSettings.listSeperatorClass, $page).each(function () {
            var $me = $(this),
                sepID = pageID + '_' + $me.attr('id').toUpperCase(),
                sepText = pageID + '_' + $me.text().toUpperCase();

            if ($me.attr('id')) {
              $me.attr('id', sepID);
            } else {
              $me.attr('id', sepText);
            }
          });

          for (i; i >= 0; --i) {
            pageIndex = '<li>' + jQT.listIndexSettings.index[i] + '</li>' + pageIndex;
          }
          $page.append('<ul id="' + pageID + '_listIndex" class="listIndex ' + device + ' ' + (h > w ? 'portrait' : 'landscape') + '">' + pageIndex + '</ul>');
          $wrapper.data('iscroll').options.vScrollbar = false;
          return document.getElementById(pageID + '_listIndex');
        };

        this.element = buildIndex($page);
        this.element.addEventListener('touchstart', this, false);
        this.element.addEventListener('click', this, false);
      };

      ListIndex.prototype = {
        handleEvent: function (e) {
          switch (e.type) {
          case 'touchstart':
            this.onTouchStart(e);
            break;
          case 'touchmove':
            this.onTouchMove(e);
            break;
          case 'touchend':
            this.onTouchEnd(e);
            break;
          case 'click':
            this.onTouchMove(e);
            break;
          }
        },

        onTouchStart: function (e) {
          var pageID = $('#' + this.element.id).parents('#jqt > div, #jqt > form').attr('id'),
              iscroll = $('.' + jQT.barsSettings.wrapperClass, '#' + pageID).data('iscroll'),
              theTarget = e.target;

          e.preventDefault();
          $('#' + pageID + '_listIndex').css({
            'background-color': 'rgba(106,115,125,0.5)'
          });
          if (theTarget.nodeType === 3) {
            theTarget = theTarget.parentNode;
          }
          theTarget = pageID + '_' + theTarget.innerText;
          if (document.getElementById(theTarget)) {
            iscroll.scrollTo(0, -document.getElementById(theTarget).offsetTop, 0);
          }
          this.element.addEventListener('touchmove', this, false);
          this.element.addEventListener('touchend', this, false);

          return false;
        },

        onTouchMove: function (e) {
          var pageID = $('#' + this.element.id).parents('#jqt > div, #jqt > form').attr('id'),
              iscroll = $('.' + jQT.barsSettings.wrapperClass, '#' + pageID).data('iscroll'),
              theTarget;

          e.preventDefault();
          try {
            theTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
            if (theTarget.nodeType === 3) {
              theTarget = theTarget.parentNode;
            }
            theTarget = pageID + '_' + theTarget.innerText;
          } catch (err) {
            theTarget = pageID + '_' + e.target.innerText;
          }
          if (document.getElementById(theTarget)) {
            theTarget = -document.getElementById(theTarget).offsetTop;
            if (theTarget < iscroll.maxScroll) {
              theTarget = iscroll.maxScroll;
            }
            iscroll.scrollTo(0, theTarget, 0);
          }

          return false;
        },

        onTouchEnd: function (e) {
          var pageID = $('#' + this.element.id).parents('#jqt > div, #jqt > form').attr('id');

          e.preventDefault();
          $('#' + pageID + '_listIndex').css({
            'background-color': 'transparent'
          });
          this.element.removeEventListener('touchmove', this, false);
          this.element.removeEventListener('touchend', this, false);

          return false;
        }
      };

      initListIndex = function (page) {
        initListIndices(page);
      };

      initListIndices = function (page) {
        var $page, indicesDelay, iScrollData, listIndexData;

        if (jQT.barsReady) {
          //multiple pages
          if (typeof (page) === 'undefined' || page === null) {
            $('#jqt .indexed').each(function () {
              $page = $(this);
              if ($page.parents('#jqt > div').length) {
                $page = $page.parents('#jqt > div');
              }
              iScrollData = $('.' + jQT.barsSettings.wrapperClass, page).data('iscroll');
              listIndexData = $page.data('listIndex');

              if ((listIndexData === null || typeof (listIndexData) === 'undefined') && (iScrollData !== null || typeof (iScrollData) !== 'undefined')) {
                $page.data('listIndex', new ListIndex($page));
              }
            });
          } else {
            //single page
            $page = $('#' + page);
            if ($page.children().hasClass('indexed') && !$page.children().hasClass('listIndex')) {
              if ($page.parents('#jqt > div').length) {
                $page = $page.parents('#jqt > div');
              }
              iScrollData = $('.' + jQT.barsSettings.wrapperClass, page).data('iscroll');
              listIndexData = $page.data('listIndex');

              if ((listIndexData === null || typeof (listIndexData) === 'undefined') && (iScrollData !== null || typeof (iScrollData) !== 'undefined')) {
                $page.data('listIndex', new ListIndex($page));
              } else {
                console.warn('#' + page + ' already has a listIndex.');
              }
            }
          }
          clearTimeout(this.indicesDelay);
        } else {
          if (typeof (page) === 'undefined' || page === null) {
            page = 'initListIndices()';
          } else {
            page = 'initListIndices(\'' + page + '\')';
          }
          this.indicesDelay = setTimeout(page, 100);
        }
      };

      $(document).ready(function () {
        var deviceDetection = function () {
            var nua = navigator.userAgent;

            if (nua.indexOf('iPhone') !== -1) {
              device = 'iPhone';
            }
            if (nua.indexOf('iPod') !== -1) {
              device = 'iPhone';
            }
            if (nua.indexOf('iPad') !== -1) {
              device = 'iPad';
            }
          };

        deviceDetection();
        initListIndices();

        $(document.body).bind('pageInserted', function (e, data) {
          if (typeof (data.page[0].innerHTML) !== 'undefined') {
            if ($(data.page).children().hasClass('indexed')) {
              initListIndex(data.page.attr('id'));
            }
          }
        });

        $('#jqt').bind('turn', function (e, data) {
          var h = window.innerHeight,
              w = window.innerWidth;

          $('.listIndex').removeClass('portrait landscape').addClass(h > w ? 'portrait' : 'landscape');
        });

      });

      return {
        initListIndices: initListIndices,
        initListIndex: initListIndex
      };

    });
  }
})(jQuery);

/*jslint onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, devel: true, browser: true, maxerr: 50, indent: 0 */
/*globals $, clearTimeout, console, document, initListIndex, initListIndices, jQT, ListIndex, setTimeout */