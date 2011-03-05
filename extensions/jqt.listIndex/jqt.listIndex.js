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

Implementation of the table index

Change Log
--------------------------------------------------------------------------------

*/

/*
(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function listIndex(jQT) {
      var ListIndexObject = {}, that = this;

      jQT.listIndex = {autoLoad_iScroll: true};


      setIndex = function () {
      };


      // Begin loading iscroll-min.js
      $(document).ready(function () {

        // Begin getPath()
        function getPath() {
          var path;
          $('script').each(function () {
            var i;
            path = $(this).attr('src');
            if (path) {
              i = path.indexOf('/jqt.bars.js');
              if (i > 0) {
                path = path.substring(0, path.lastIndexOf('/') + 1);
                return false;
              }
            }
          });
          return path;
        }
        // End getPath()

        if(jQT.listIndex.autoLoad_iScroll) {
          var filename = 'iscroll-min.js';
          $.getScript(getPath() + filename, function () {
          });
        } else {
        }
      });
      // End loading iscroll-min.js

      return {
      };


    });
  }
})(jQuery);
*/

  function ListIndexObject($page) {
    var index = ['#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    
    buildIndex = function ($page) {
      var i = index.length - 1,
          pageID = $page.attr('id'),
          pageIndex = '';

      for (i; i >= 0; --i) {
        pageIndex = '<li>' + index[i] + '</li>' + pageIndex;
      }

      $page.append('<ul id="' + pageID + '_listIndex" class="listIndex">' + pageIndex + '</ul>');
      $page.data('iscroll').options.vScrollbar = false;
      jQT.setPageHeight();
      return document.getElementById(pageID + '_listIndex');
    };

    this.element = buildIndex($page);
    this.element.addEventListener('touchstart', this, false);
    this.element.addEventListener('click', this, false);
  }

  ListIndexObject.prototype = {
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
console.log('onTouchStart');
      e.preventDefault();
      this.element.className = 'hover';
  
      var theTarget = e.target;
      if (theTarget.nodeType === 3) {
        theTarget = theTarget.parentNode;
      }
      theTarget = theTarget.innerText;
  
      if (document.getElementById(theTarget)) {
        myScroll.scrollTo(0, -document.getElementById(theTarget).offsetTop, 0);
      }
      this.element.addEventListener('touchmove', this, false);
      this.element.addEventListener('touchend', this, false);
  
      return false;
    },
  
    onTouchMove: function (e) {
console.log('onTouchMove');
console.log(this)
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
  
        myScroll.scrollTo(0, theTarget, 0);
      }
  
      return false;
    },
  
    onTouchEnd: function (e) {
console.log('onTouchEnd');
      e.preventDefault();
      this.element.className = '';
      this.element.removeEventListener('touchmove', this, false);
      this.element.removeEventListener('touchend', this, false);
  
      return false;
    }
  };

$(document).ready(function () {

  initListIndex = function() {
    var delay;

    if (barsReady) {
      $('#jqt .indexed').each(function(){
        var $page = $(this);
        if ($page.parents('#jqt > div').length) {
          $page = $page.parents('#jqt > div');
        }
        $page.data('listIndex', new ListIndexObject($page));
      });
      clearTimeout(this.delay);
    } else {
      this.delay = setTimeout('initListIndex()', 100);
    }
  };

  initListIndex();
});
/*

<!-- listIndex -->
<div id="listIndex">
  <ul>
    <li>#</li><li>A</li><li>B</li><li>C</li><li>D</li><li>E</li><li>F</li><li>G</li><li>H</li><li>I</li><li>J</li><li>K</li><li>L</li><li>M</li><li>N</li><li>O</li><li>P</li><li>Q</li><li>R</li><li>S</li><li>T</li><li>U</li><li>V</li><li>W</li><li>X</li><li>Y</li><li>Z</li>
  </ul>
</div>

*/