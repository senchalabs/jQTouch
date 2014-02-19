(function() {

  // Fire a simulated touch event.
  // While it is possible to fire real touch events,
  // there are cross-browser issues, and this way we
  // can test touch events in browsers that don't
  // actually support touch input (like desktop Safari).
  //
  // Zepto's touch module only uses the `pageX/Y` and `target`
  // properties of the first touch in the `touches` TouchList
  function fire(type, element, x, y) {
    var event = document.createEvent('Event'), touch = {
      pageX: x,
      pageY: y,
      target: element
    }

    event.initEvent('touch' + type, true, true)
    event.touches = [touch]

    element.dispatchEvent(event)
  }

  function down(element, x, y) {
    fire('start', element, x, y)
  }
  function move(element, x, y) {
    fire('move', element, x, y)
  }
  function up(element) {
    fire('end', element)
  }

  module('TouchTest', {
    setup: function() {
      $('<a id=test>TEST ELEMENT</div>').appendTo('body')
    },

    teardown: function() {
      $('#test').off()
      $('#test').remove()
    }
  });

  asyncTest('testTap', function(t) {
    expect(1)

    var count = 0, element = $('#test').get(0)

    $('#test').on('tap', function() {
      count++
    })

    down(element, 10, 10)
    up(element)

    setTimeout(function() {
      start();
      equal(1, count);
    }, 50)
  });

  asyncTest('testSingleTapDoesNotInterfereWithTappingTwice', function(t) {
    expect(1)

    var count = 0, element = $('#test').get(0)

    $('#test').on('tap', function() {
      count++
    })

    down(element, 10, 10)
    up(element)

    setTimeout(function() {

      down(element, 10, 10)
      up(element)

      setTimeout(function() {
        start()

        equal(2, count)
      }, 200)
    }, 200)
  });

  // should be fired if there is one tap within 250ms
  asyncTest('testSingleTap', function(t) {
    expect(2)

    var singleCount = 0, doubleCount = 0, element = $('#test').get(0)

    setTimeout(function() {
      $('#test').on('singleTap', function() {
        singleCount++
      }).on('doubleTap', function() {
        doubleCount++
      })

      down(element, 10, 10)
      up(element)

      setTimeout(function() {
        start()

        equal(1, singleCount, 'expect a singleTap')
        equal(0, doubleCount, 'expect no doubleTap')
      }, 300)
    }, 300); // ensure last test won't affect this one
  });

  // should be fired if there are two taps within 250ms
  asyncTest('testDoubleTap', function(t) {
    expect(2)

    var singleCount = 0, doubleCount = 0, element = $('#test').get(0)

    $('#test').on('singleTap', function() {
      singleCount++
    }).on('doubleTap', function() {
      doubleCount++
    })

    down(element, 10, 10)
    up(element)

    setTimeout(function() {
      down(element, 12, 12)
      up(element)

      setTimeout(function() {
        start()

        equal(0, singleCount)
        equal(1, doubleCount)
      }, 100)
    }, 100)
  });

  // should be fired if the finger is down in the same location for >750ms
  asyncTest('testLongTap', function(t) {
    var count = 0, element = $('#test').get(0)

    $('#test').on('longTap', function() {
      count++
    })

    down(element, 10, 10)

    setTimeout(function() {
      start();

      up(element)

      equal(1, count)
    }, 900)
  });

  asyncTest('testLongTapDoesNotFireIfFingerIsMoved', function(t) {
    expect(1)

    var count = 0, element = $('#test').get(0)

    setTimeout(function() {
      $('#test').on('longTap', function() {
        count++
      })
      down(element, 10, 10)

      setTimeout(function() {
        move(element, 50, 10)

        setTimeout(function() {
          start();

          up(element)
          equal(0, count, 'expect moved long tap does not trigger longTap.')
        }, 450)
      }, 450)
    }, 1000)
  });

  asyncTest('testSwipe', function(t) {
    expect(1)

    var swipeCount = 0, element = $('#test').get(0)

    $('#test').on('swipe', function() {
      swipeCount++
    })

    down(element, 10, 10)

    setTimeout(function() {

      move(element, 70, 10)
      up(element)

      setTimeout(function() {
        start();
        equal(1, swipeCount)
      }, 50)
    }, 50)
  });
})();
