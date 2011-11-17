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
    var SUPPORT_TOUCH = (!!window.Touch);
    var START_EVENT = SUPPORT_TOUCH? 'touchstart' : 'mousedown';
    var MOVE_EVENT = SUPPORT_TOUCH? 'touchmove' : 'mousemove';
    var END_EVENT = SUPPORT_TOUCH? 'touchend' : 'mouseup';
    var CANCEL_EVENT = SUPPORT_TOUCH? 'touchcancel' : 'mouseout'; // mouseout on document
    var lastTime = 0;
    var tapReady = true;
    var jQTSettings = {
          debug: true,
          moveThreshold: 10,
          hoverDelay: 50,
          pressDelay: 1000
    };

    function _debug(message) {
        var now = new Date().getTime();
        var delta = now - lastTime;
        lastTime = now;
        if (jQTSettings.debug) {
            if (message) {
                _log(delta + ': ' + message);
            } else {
                _log(delta + ': ' + 'Called ' + arguments.callee.caller.name);
            }
        }
    }

    function _log(message) {
        if (window.console !== undefined) {
            console.log(message);
        }
    }

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

        touch = SUPPORT_TOUCH? event.changedTouches[0]: event;
        startX = touch.pageX;
        startY = touch.pageY;

        // Prep the element
        bindEvents($el);

        hoverTimeout = setTimeout(function() {
            $el.makeActive();
        }, jQTSettings.hoverDelay);

        pressTimeout = setTimeout(function() {
            unbindEvents($el);
            $el.unselect();
            clearTimeout(hoverTimeout);
            $el.trigger('press');
        }, jQTSettings.pressDelay);

        // Private touch functions
        function touchCancelHandler(e) {
            _debug();
            clearTimeout(hoverTimeout);
            $el.unselect();
            unbindEvents($el);
        }

        function touchEndHandler(e) {
            _debug();
            // updateChanges();
            unbindEvents($el);
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
                unbindEvents($el);
                $el.trigger('swipe', {direction:direction, deltaX:deltaX, deltaY: deltaY});
            }
            $el.unselect();
            clearTimeout(hoverTimeout);
            if (absX > jQTSettings.moveThreshold || absY > jQTSettings.moveThreshold) {
                clearTimeout(pressTimeout);
            }
        }

        function touchCancelHandler(e) {
            if ($el) $el.removeClass('active');
            unbindEvents();
        };

        function updateChanges() {
            // _debug();
            var firstFinger = SUPPORT_TOUCH? event.changedTouches[0]: event; 
            deltaX = firstFinger.pageX - startX;
            deltaY = firstFinger.pageY - startY;
            deltaT = (new Date).getTime() - startTime;
            // _debug('deltaX:'+deltaX+';deltaY:'+deltaY+';');
        }

        function bindEvents($el) {
            $el.bind(MOVE_EVENT, touchMoveHandler).bind(END_EVENT, touchEndHandler);
            if (SUPPORT_TOUCH) {
                $el.bind(CANCEL_EVENT, touchCancelHandler);
            } else {
                $(document).bind('mouseout', touchCancelHandler);
            }
        }

        function unbindEvents($el) {
            $el.unbind(MOVE_EVENT, touchMoveHandler).unbind(END_EVENT, touchEndHandler);
            if (SUPPORT_TOUCH) {
                $el.unbind(CANCEL_EVENT, touchCancelHandler);
            } else {
                $(document).unbind('mouseout', touchCancelHandler);
            }
        }
    } // End touch handler

    $.jQTouch = function(options) {

        // take in options
        for (i in options) jQTSettings[i] = options[i];
        
        $(document).bind('ready', function() {
            $('#jqt').bind(START_EVENT, touchStartHandler);  
        });

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

        options.serialize = function($form) {
            return $form.serialize();
        };

        var core = jQTouchCore(options);
        return core;
    };
})(jQuery);
