function abc(el) {
  this.element = el;
  this.element.addEventListener('touchstart', this, false);
}

abc.prototype = {
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
    }
  },

  onTouchStart: function (e) {
    e.preventDefault();
    this.element.className = 'hover';

    var theTarget = e.target;
    if (theTarget.nodeType === 3) {
      theTarget = theTarget.parentNode;
    }
    theTarget = theTarget.innerText;

    if (document.getElementById(theTarget)) {
      myScroll.scrollTo(0, -document.getElementById(theTarget).offsetTop, '0s');
    }
    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);

    return false;
  },

  onTouchEnd: function (e) {
    e.preventDefault();
    this.element.className = '';

    this.element.removeEventListener('touchmove', this, false);
    this.element.removeEventListener('touchend', this, false);

    return false;
  },

  onTouchMove: function (e) {
    e.preventDefault();

    var theTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    if (theTarget.nodeType === 3) {
      theTarget = theTarget.parentNode;
    }
    theTarget = theTarget.innerText;

    if (document.getElementById(theTarget)) {
			theTarget = -document.getElementById(theTarget).offsetTop;
      if(theTarget < myScroll.maxScroll) {
        theTarget = myScroll.maxScroll;
      }

      myScroll.scrollTo(0, theTarget, '0s');
    }

    return false;
  }
};

$(document).ready(function () {
  new abc(document.getElementById('alphaIndex'));
});


/*
(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function alphaIndex(jQT) {

      


    });
  }
})(jQuery);
*/
