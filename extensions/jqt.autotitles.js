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

    (c) 2011 by jQTouch project members.
    See LICENSE.txt for license.

=======
Modified to honor hardcoded titles; set back button text - Daniel J. Pinter - DataZombies

DataZombies@gmail.com
http://twitter.com/HeadDZombie
https://github.com/DataZombies/

Change Log
--------------------------------------------------------------------------------
2011-04-04 Added pageInseted event to set an AJAX loaded page's backbutton based
on the referring page's title. The title on AJAX loaded pages can not be set
because $(e.target).data('referrer'), which contains the ID of the link the user
clicked on, doesn't exist. Added AJAX page to demo.

2011-03-13 autoTitles now preserves Backbutton images

2011-02-28 Removed extraneous temporary expression 

2011-02-27 very minor edits 

2011-02-26 jqt.autottitles.js: set page title and back button from referring
page; honors hardcoded title and back button text; new demo. 

2011-01-21 jqt.autotitles fixed; added hard coded title example to demo. 

2011-01-20 Fixed autotitle demo's title & existing title in target page logic. 

2010-07-26 The change prevents hardcoded titles from being overwritten by the
extension.

*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function AutoTitles(jQT) {
      var backButtonSelector = '.toolbar .back',
          parentSelector = '#jqt > div, #jqt > form',
          titleSelector = '.toolbar h1';

      $(function () {
        var eventIn, eventOut;

        eventIn = function (e) {
          var $backButton = $(e.target) !== null ? $(backButtonSelector, $(e.target)) : null,
              $referrer = $(e.target).data('referrer'),
              $title = $(e.target) !== null ? $(titleSelector, $(e.target)) : null;

          if ($backButton.data('hardCoded') === null || typeof($backButton.data('hardCoded')) === 'undefined') {
            $backButton.data('hardCoded', $backButton.html() !== '');
          }
          if ($backButton && $referrer && !$backButton.data('hardCoded')) {
            $backButton.data('backButton', $backButton.html());
            $backButton.text($referrer.parents(parentSelector).find(titleSelector).text());
          }

          if ($title.data('hardCoded') === null || typeof($title.data('hardCoded')) === 'undefined') {
            $title.data('hardCoded', $title.html() !== '');
          }
          if ($title && $referrer && !$title.data('hardCoded')) {
            $title.data('title', $title.html());
            $title.text($referrer.text());
          }
        };

        eventOut = function (e) {
          var $backButton = $(e.target) !== null ? $(backButtonSelector, $(e.target)) : null,
              $title = $(e.target) !== null ? $(titleSelector, $(e.target)) : null;

          if ($backButton) {
            $backButton.text($backButton.data('backButton'));
            $backButton.data('backButton', null);
          }

          if ($title) {
            $title.text($title.data('title'));
            $title.data('title', null);
          }
        };

        $('#jqt').bind('pageAnimationStart', function (e, data) {
          if (data.direction === 'out') {
            eventOut(e);
          } else {
            eventIn(e);
          }
        });

        $('#jqt').bind('pageAnimationEnd', function (e, data) {
          if (data.direction === 'in') {
            eventIn(e);
          } else {
            eventOut(e);
          }
        });

        $(document.body).bind('pageInserted', function (e, data) {
          var $backButton = data.page !== null ? $(backButtonSelector, data.page) : null;

          if ($backButton && $backButton.text() !== '') {
            $backButton.data('hardCoded', $backButton.html() !== '');
          }

          if ($backButton && !$backButton.data('hardCoded')) {
            $backButton.text($(titleSelector, '.current').text());
          }
        });

      });

      function setBackButtonSelector(bs) {
        backButtonSelector = bs;
      }

      function setParentSelector(ps) {
        parentSelector = ps;
      }

      function setTitleSelector(ts) {
        titleSelector = ts;
      }

      return {
        setBackButtonSelector: setBackButtonSelector,
        setParentSelector: setParentSelector,
        setTitleSelector: setTitleSelector
      };
    });
  }
})(jQuery);