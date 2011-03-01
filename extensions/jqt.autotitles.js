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
                    
                    if ($backButton.data('hardCoded') === null) {
                        $backButton.data('hardCoded', $backButton.text() !== '');
                    }
                    if ($backButton && $referrer && !$backButton.data('hardCoded')) {
                        $backButton.data('backButton', $backButton.text());
                        $backButton.text($referrer.parents(parentSelector).find(titleSelector).text());
                    }
                    
                    if ($title.data('hardCoded') === null) {
                        $title.data('hardCoded', $title.text() !== '');
                    }
                    if ($title && $referrer && !$title.data('hardCoded')) {
                        $title.data('title', $title.text());
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