/*

    jQuery Bridge for jQTouch
    (adds events which Zepto includes by default)

    Created by David Kaneda <http://www.davidkaneda.com>
    Maintained by Jonathan Stark <http://jonathanstark.com/>
    Sponsored by Sencha Labs <http://www.sencha.com/>

    Documentation and issue tracking on GitHub <http://wiki.github.com/senchalabs/jQTouch/>

    (c) 2009-2011 by jQTouch project members.
    See LICENSE.txt for license.

*/

(function($) {
    var SUPPORT_TOUCH = (!!window.Touch),
        START_EVENT = SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
        MOVE_EVENT = SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
        END_EVENT = SUPPORT_TOUCH ? 'touchend' : 'mouseup',
        CANCEL_EVENT = SUPPORT_TOUCH ? 'touchcancel' : 'mouseout', // mouseout on document
        lastTime = 0,
        tapReady = true,
        jQTSettings = {
          useFastTouch: true, // experimental
          debug: true,
          moveThreshold: 10,
          hoverDelay: 50,
          pressDelay: 750
        };

    function warn(message) {
        if (window.console !== undefined) {
            console.log(message);
        }
    }

    function touchStartHandler(e) {

        if (!tapReady) {
            warn('TouchStart handler aborted because tap is not ready');
            e.preventDefault();
            return false;
        }

        var $el = $(e.target);

        // Error check
        if (!$el.length) {
            warn('Could not find target of touchstart event.');
            return;
        }

        var startTime = new Date().getTime(),
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
            clearTimeout(hoverTimeout);
            $el.unselect();
            unbindEvents($el);
        }

        function touchEndHandler(e) {
            // updateChanges();
            unbindEvents($el);
            clearTimeout(hoverTimeout);
            clearTimeout(pressTimeout);
            if (Math.abs(deltaX) < jQTSettings.moveThreshold && Math.abs(deltaY) < jQTSettings.moveThreshold && deltaT < jQTSettings.pressDelay) {
                // e.preventDefault();
                // e.stopImmediatePropagation();
                if (SUPPORT_TOUCH && jQTSettings.useFastTouch) {
                    $el.trigger('tap', e);
                }
            } else {
                $el.unselect();
            }
        }

        function touchMoveHandler(e) {
            updateChanges();
            var absX = Math.abs(deltaX);
            var absY = Math.abs(deltaY);
            var direction;
            if (absX > absY && (absX > 30) && deltaT < 1000) {
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

        function updateChanges() {
            var firstFinger = SUPPORT_TOUCH? event.changedTouches[0]: event; 
            deltaX = firstFinger.pageX - startX;
            deltaY = firstFinger.pageY - startY;
            deltaT = new Date().getTime() - startTime;
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
            if (!$el) return;

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
        for (var i in options) {
            jQTSettings[i] = options[i];
        }
        
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

        var core = jQTouchCore(options);
        
        return core;
    };
    
    // Extensions directly manipulate the jQTouch object, before it's initialized.
    $.jQTouch.addExtension = function(extension) {
        jQTouchCore.prototype.extensions.push(extension);
    };

})(jQuery);