/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Maintained by Thomas Yip <http://beedesk.com/>
    Sponsored by Sencha Labs <http://www.sencha.com/>
    Special thanks to Jonathan Stark <http://www.jonathanstark.com/>

    Documentation and issue tracking on GitHub <http://github.com/senchalabs/jQTouch/>

    (c) 2009-2011 Sencha Labs
    jQTouch may be freely distributed under the MIT license.

*/

(function($){
  var touch = {}, touchTimeout;

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode;
  }

  function swipeDirection(x1, x2, y1, y2){
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
    if (xDelta >= yDelta) {
      return (x1 - x2 > 0 ? 'Left' : 'Right');
    } else {
      return (y1 - y2 > 0 ? 'Up' : 'Down');
    }
  }

  var longTapDelay = 750;
  function longTap(){
    if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
      touch.el.trigger('longTap');
      touch = {};
    }
  }

  $(document).ready(function(){    
    var SUPPORT_TOUCH = (typeof Touch != "undefined");
    var START_EVENT = SUPPORT_TOUCH? 'touchstart' : 'mousedown';
    var MOVE_EVENT = SUPPORT_TOUCH? 'touchmove' : 'mousemove';
    var END_EVENT = SUPPORT_TOUCH? 'touchend' : 'mouseup';
    var CANCEL_EVENT = SUPPORT_TOUCH? 'touchcancel' : 'mouseout'; // mouseout on document

    function isRightClick(e) {
      var rightclick = false;

      if (!SUPPORT_TOUCH) {
        // http://www.quirksmode.org/js/events_properties.html
        if (!e) var e = window.event;
        if (e.which) rightclick = (e.which == 3);
        else if (e.button) rightclick = (e.button == 2);
      }
      return rightclick;
    }

    function touchstartHandler(e) {
      console.warn('touch started');
      try {
      var $oel, $el, $marked;
      var elX, elY;

      if (isRightClick(e)) {
        return;
      }

      $oel = $(e.target);
      $el = $oel;
      elStartY = $el.offset().top;
      elStartX = $el.offset().left;

      var hovertimeout = null;
      var presstimeout = null;
      var startX, startY, startTime;
      var deltaX, deltaY, deltaT;
      var endX, endY, endTime;
      var swipped = false, tapped = false, moved = false, inprogress = false, pressed = false;

      function bindEvents($el) {
          $el.bind(MOVE_EVENT, handlemove).bind(END_EVENT, handleend);
          if ($.support.touch) {
              $el.bind(CANCEL_EVENT, handlecancel);
          } else {
              $(document).bind('mouseout', handleend);
          }
      }

      function unbindEvents($el) {
          $el.unbind(MOVE_EVENT, handlemove).unbind(END_EVENT, handleend);
          if ($.support.touch) {
              $el.unbind(CANCEL_EVENT, handlecancel);
          } else {
              $(document).unbind('mouseout', handlecancel);
          }
      }

      function updateChanges(e) {
          var point = e.originalEvent;
          var first = $.support.touch? point.changedTouches[0]: point;
          deltaX = first.pageX - startX;
          deltaY = first.pageY - startY;
          deltaT = (new Date).getTime() - startTime;
          var absElOffset = $el.offset();
          elX = absElOffset.left - elStartX;
          elY = absElOffset.top - elStartY;
      }

      function handlestart(e) {
          var point;

          inprogress = true, swipped = false, tapped = false,
          moved = false, timed = false, pressed = false;
          point = e.originalEvent;
          startX = $.support.touch? point.changedTouches[0].pageX: point.pageX;
          startY = $.support.touch? point.changedTouches[0].pageY: point.pageY;
          startTime = (new Date).getTime();
          endX = null, endY = null, endTime = null;
          deltaX = 0;
          deltaY = 0;
          deltaT = 0;

          // Let's bind these after the fact, so we can keep some internal values
          bindEvents($el);

          setTimeout(function() {
              $marked = $el;
              while ($marked.parent().is(mySelectors)) {
                $marked = $marked.parent();
              }

              handlehover();
          }, 50);

          setTimeout(function() {
            $el.trigger("touch");
          }, 50);

          setTimeout(function() {
            handlepress(e);
          }, 1000);
      };

      function handlemove(e) {
          updateChanges(e);

          if (!inprogress)
            return;

          var absX = Math.abs(deltaX);
          var absY = Math.abs(deltaY);

          if (absX > 1 || absY > 1) {
              moved = true;
          }
          if (absY <= 5 && elX === 0 && elY === 0) {
              if (absX > (3 * absY) && (absX > 10) && deltaT < 1000) {
                  inprogress = false;
                  if ($marked) $marked.removeClass('active');
                  unbindEvents($el);

                  swipped = true;
                  $el.trigger('swipe', {direction: (deltaX < 0) ? 'left' : 'right', deltaX: deltaX, deltaY: deltaY });
              }
          } else {
              // moved too much, can't swipe anymore
              inprogress = false;
              if ($marked) $marked.removeClass('active');
              unbindEvents($el);
          }
      };

      function handleend(e) {
          updateChanges(e);
          var absX = Math.abs(deltaX);
          var absY = Math.abs(deltaY);

          inprogress = false;
          unbindEvents($el);
          if (!tapped && (absX <= 1 && absY <= 1) && (elX === 0 && elY === 0)) {
              tapped = true;
              $oel.trigger('tap');
              setTimeout(function() {
                if ($marked) $marked.removeClass('active');
            }, 1000);
          } else {
              if ($marked) $marked.removeClass('active');
              //e.preventDefault();
          }
      };

      function handlecancel(e) {
          inprogress = false;
          if ($marked) $marked.removeClass('active');
          unbindEvents();
      };

      function handlehover() {
          timed = true;
          if (tapped) {
              // flash the selection
              $marked.addClass('active');
              hovertimeout = setTimeout(function() {
                  $marked.removeClass('active');
              }, 1000);
          } else if (inprogress && !moved) {
              $marked.addClass('active');
          }
      };

      function handlepress(e) {
        if (inprogress && !tapped && !moved) {
          pressed = true;
          tapped = true;
          $el.trigger('press');
        }
      }

      handlestart(e);
      } catch (e) {
        console.error('tap error: ' + e);
      }

    }; // End touch handler

    $(document.body).bind('touchstart', touchstartHandler);
  });

  ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  });
})($);
