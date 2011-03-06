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

=======
jqt.listIndex.js - Daniel J. Pinter - DataZombies

Implementation of the cubiq.org's list index for jQT.

Change Log
--------------------------------------------------------------------------------

*/

ListIndex = function ($page) {
  var buildIndex, index = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  buildIndex = function ($page) {
    var i = index.length - 1,
        pageID = $page.attr('id'),
        pageIndex = '';

    $('.sep', $page).each(function () {
      var $me = $(this),
          sepID = pageID + $me.attr('id'),
          sepText = pageID + $me.text();

      if ($me.attr('id')) {
        $me.attr('id', sepID);
      } else {
        $me.attr('id', sepText);
      }
    });

    for (i; i >= 0; --i) {
      pageIndex = '<li>' + index[i] + '</li>' + pageIndex;
    }
    $page.append('<ul id="' + pageID + 'listIndex" class="listIndex">' + pageIndex + '</ul>');
    $page.data('iscroll').options.vScrollbar = false;
    jQT.setPageHeight();
    return document.getElementById(pageID + 'listIndex');
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
        iscroll = $('#' + pageID).data('iscroll'),
        theTarget = e.target;

    e.preventDefault();
    $('#' + pageID + 'listIndex').css({
      'background-color': 'rgba(106,115,125,0.5)'
    });
    if (theTarget.nodeType === 3) {
      theTarget = theTarget.parentNode;
    }
    theTarget = pageID + theTarget.innerText;
    if (document.getElementById(theTarget)) {
      iscroll.scrollTo(0, -document.getElementById(theTarget).offsetTop, 0);
    }
    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);

    return false;
  },

  onTouchMove: function (e) {
    var pageID = $('#' + this.element.id).parents('#jqt > div, #jqt > form').attr('id'),
        iscroll = $('#' + pageID).data('iscroll'),
        theTarget;

    e.preventDefault();
    try {
      theTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
      if (theTarget.nodeType === 3) {
        theTarget = theTarget.parentNode;
      }
      theTarget = pageID + theTarget.innerText;
    } catch (err) {
      theTarget = pageID + e.target.innerText;
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
    $('#' + pageID + 'listIndex').css({
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
  var $page, indicesDelay;

  if (jQT.barsReady) {
    if (typeof(page) === 'undefined' || page === null) {
      $('#jqt .indexed').each(function () {
        $page = $(this);
        if ($page.parents('#jqt > div').length) {
          $page = $page.parents('#jqt > div');
        }
        if (typeof($page.data('listIndex')) === 'undefined' || $page.data('listIndex') === null) {
          $page.data('listIndex', new ListIndex($page));
        }
      });
    } else {
      $page = $('#' + page);
      if ($page.parents('#jqt > div').length) {
        $page = $page.parents('#jqt > div');
      }
      if (typeof($page.data('listIndex')) === 'undefined' || $page.data('listIndex') === null) {
        $page.data('listIndex', new ListIndex($page));
      } else {
        console.warn('#' + page + ' already has a listIndex.');
      }      
    }
    clearTimeout(this.indicesDelay);
  } else {
    if (typeof(page) === 'undefined' || page === null) {
      page = 'initListIndices()';
    } else {
      page = 'initListIndices(\'' + page + '\')';
    }
    this.indicesDelay = setTimeout(page, 100);
  }
};

$(document).ready(function () {
//  initListIndices();
});
$(document).ready(function () {
//  initListIndex('bigList');
});

/*jslint onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, devel: true, browser: true, maxerr: 50, indent: 0 */
/*globals $, clearTimeout, console, document, initListIndex, initListIndices, jQT, ListIndex, setTimeout */