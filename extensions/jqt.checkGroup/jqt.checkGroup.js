/*

            _/    _/_/    _/_/_/_/_/                              _/       
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/    
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/   
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/    
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/     
       _/                                                                  
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    checkGroup extension by Daniel J. Pinter <Nimbus.Software@gmail.com>
    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>
    
    Special thanks to Jonathan Stark <http://jonathanstark.com/>
    and pinch/zoom <http://www.pinchzoom.com/>
    
    (c) 2009 by jQTouch project members.
    See LICENSE.txt for license.

jqt.checkGroup - Daniel J. Pinter - DataZombies

Use the getCGValue method to use the user's selection
  var a = jQT.getCGValue(0).cgName;
  var b = jQT.getCGValue(0).cgValue;

If you want the selection stored in localStorage set this to true:
  jQT.cgUseLocalStorage = true;

The selected item's color is stored in the extension's theme (apple.css, jqt.css) ul.checkGroup li input[type=radio] CSS rule.
*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function checkGroup(jQT) {
      var defaultColor, cgName, selectedColor, cgValue,
      cgUseLocalStorage = new Boolean();
      
      $("ul.checkGroup li input[type=radio]").css("-webkit-appearance","textarea");
      $("ul.checkGroup li input[type=radio]").css("background-color","transparent");
      $("ul.checkGroup li input[type=radio]").css("background-position","right center");
      $("ul.checkGroup li input[type=radio]").css("background-repeat","no-repeat");
      $("ul.checkGroup li input[type=radio]").css("border","1px");
      $("ul.checkGroup li input[type=radio]").css("float","right");
      $("ul.checkGroup li input[type=radio]").css("height","13px");
      $("ul.checkGroup li input[type=radio]").css("margin-right","0");
      $("ul.checkGroup li input[type=radio]").css("position","relative;");
      $("ul.checkGroup li input[type=radio]").css("top","0");
      $("ul.checkGroup li input[type=radio]").css("width","20px");

      initCG = function () {
        $(".checkGroup").children("li").click(function () {
          $(this).siblings().each(function () {
            if (typeof defaultColor === 'undefined' && $("ul.checkGroup li").css("color") !== selectedColor) {
              defaultColor = $("#jqt ul.checkGroup li").css("color");
            }
            $(this).css("color", defaultColor);
          });
          $($(this).children("input")).each(function () {
            this.checked = true;
              cgName = $(this).attr("name");
              cgValue = $(this).attr("value");
            if (cgUseLocalStorage) {
              localStorage.setItem(cgName, cgValue);
              getCGValue();
            }
          });
          if (typeof selectedColor === 'undefined') {
            selectedColor = $("ul.checkGroup li input:radio").css("color");
          }
          $(this).css("color", selectedColor);
        });  
      };
      getCGValue = function(){
        return {
          cgName: cgName,
          cgValue: cgValue
        };
      };
      initCG();
      return {
        initCG: initCG,
        getCGValue: getCGValue
      };
    });
  }
})(jQuery);