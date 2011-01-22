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
        $.jQTouch.addExtension(function AutoTitles(jQT) {
            var titleSelector = '.toolbar h1';

            $(function () {
                $('#jqt').bind('pageAnimationStart', function (e, data) {
                    var $ref = $(e.target).data('referrer'),
                        $title = $(titleSelector, $(e.target));
                    if (data.direction === 'in') {
                        if ($title.html() === '' && $ref && $title.data('title') !== $ref.text()) {
                            $title.data('title', $title.html());
                            $title.html($ref.text());
                        }
                    } else {
                        if (typeof($title.data('title')) !== 'undefined' && $title.data('title') !== null) {
                            $title.html($title.data('title'));
                            $title.data('title', null);
                        }
                    }
                });
            });

            function setTitleSelector(ts) {
                titleSelector = ts;
            }

            return {
                setTitleSelector: setTitleSelector
            };
        });
    }
})(jQuery);