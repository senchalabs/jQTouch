/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Maintained by Jonathan Stark <http://jonathanstark.com/>
    Sponsored by Sencha Labs <http://www.sencha.com/>

    Documentation and issue tracking on GitHub <http://wiki.github.com/senchalabs/jQTouch/>

    (c) 2009-2011 by jQTouch project members.
    See LICENSE.txt for license.

    $Revision: $
    $Date: $
    $LastChangedBy: $

*/

(function($) {
    function touchStartHandler(e) {
        _debug();

        if (!tapReady) {
            _debug('TouchStart handler aborted because tap is not ready');
            e.preventDefault();
            return false;
        }

        var $el = $(e.target);

        // Error check
        if (!$el.length) {
            _debug('Could not find target of touchstart event.');
            return;
        }

        var startTime = (new Date).getTime(),
            hoverTimeout = null,
            pressTimeout = null,
            touch,
            startX,
            startY,
            deltaX = 0,
            deltaY = 0,
            deltaT = 0;

        if (event.changedTouches && event.changedTouches.length) {
            touch = event.changedTouches[0];
            startX = touch.pageX;
            startY = touch.pageY;
        }

        // Prep the element
        $el.bind('touchmove',touchMoveHandler).bind('touchend',touchEndHandler).bind('touchcancel',touchCancelHandler);

        hoverTimeout = setTimeout(function() {
            $el.makeActive();
        }, jQTSettings.hoverDelay);

        pressTimeout = setTimeout(function() {
            $el.unbind('touchmove',touchMoveHandler).unbind('touchend',touchEndHandler).unbind('touchcancel',touchCancelHandler);
            $el.unselect();
            clearTimeout(hoverTimeout);
            $el.trigger('press');
        }, jQTSettings.pressDelay);

        // Private touch functions
        function touchCancelHandler(e) {
            _debug();
            clearTimeout(hoverTimeout);
            $el.unselect();
            $el.unbind('touchmove',touchMoveHandler).unbind('touchend',touchEndHandler).unbind('touchcancel',touchCancelHandler);
        }

        function touchEndHandler(e) {
            _debug();
            // updateChanges();
            $el.unbind('touchend',touchEndHandler).unbind('touchcancel',touchCancelHandler);
            clearTimeout(hoverTimeout);
            clearTimeout(pressTimeout);
            if (Math.abs(deltaX) < jQTSettings.moveThreshold && Math.abs(deltaY) < jQTSettings.moveThreshold && deltaT < jQTSettings.pressDelay) {
                // e.preventDefault();
                // e.stopImmediatePropagation();
                $el.trigger('tap', e);
            } else {
                $el.unselect();
            }
        }

        function touchMoveHandler(e) {
            // _debug();
            updateChanges();
            var absX = Math.abs(deltaX);
            var absY = Math.abs(deltaY);
            var direction;
            if (absX > absY && (absX > 35) && deltaT < 1000) {
                if (deltaX < 0) {
                    direction = 'left';
                } else {
                    direction = 'right';
                }
                $el.unbind('touchmove',touchMoveHandler).unbind('touchend',touchEndHandler).unbind('touchcancel',touchCancelHandler);
                $el.trigger('swipe', {direction:direction, deltaX:deltaX, deltaY: deltaY});
            }
            $el.unselect();
            clearTimeout(hoverTimeout);
            if (absX > jQTSettings.moveThreshold || absY > jQTSettings.moveThreshold) {
                clearTimeout(pressTimeout);
            }
        }

        function updateChanges() {
            // _debug();
            var firstFinger = event.changedTouches[0] || null;
            deltaX = firstFinger.pageX - startX;
            deltaY = firstFinger.pageY - startY;
            deltaT = (new Date).getTime() - startTime;
            // _debug('deltaX:'+deltaX+';deltaY:'+deltaY+';');
        }
    } // End touch handler

    $.jQTouch = function(options) {

        $('#jqt').bind('touchstart', touchStartHandler);

        $.fn.press = function(fn) {
            if ($.isFunction(fn)) {
                return $(this).live('press', fn);
            } else {
                return $(this).trigger('press');
            }
        };
        $.fn.swipe = function(fn) {
            if ($.isFunction(fn)) {
                return $(this).live('swipe', fn);
            } else {
                return $(this).trigger('swipe');
            }
        };
        $.fn.tap = function(fn) {
            if ($.isFunction(fn)) {
                return $(this).live('tap', fn);
            } else {
                return $(this).trigger('tap');
            }
        };

        options.framework = $;
        var core = TouchCore(options);
        return core;
    };
})(jQuery);
