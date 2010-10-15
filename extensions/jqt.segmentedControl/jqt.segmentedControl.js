/*

            _/    _/_/    _/_/_/_/_/                              _/       
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/    
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/   
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/    
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/     
       _/                                                                  
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    segmentedControl extension by Daniel J. Pinter <Nimbus.Software@gmail.com>
    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>

    Special thanks to Jonathan Stark <http://jonathanstark.com/>
    and pinch/zoom <http://www.pinchzoom.com/>

    (c) 2009 by jQTouch project members.
    See LICENSE.txt for license.

jqt.checkGroup - Daniel J. Pinter - DataZombies

// Use the getCGValue method to use the user's selection
//  var a = jQT.getSCValue(0).cgName;
//  var b = jQT.getSCValue(0).cgValue;

// If you want the selection stored in localStorage set this to true:
  jQT.scUseLocalStorage = true;
*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function segmentedControl(jQT) {
      var scName, scValue;
      var scUseLocalStorage = new Boolean();

      $("#jqt ul.segmentedControl").css("background","none");
      $("#jqt ul.segmentedControl").css("border","0");
      $("#jqt ul.segmentedControl").css("font-size","1px");
      $("#jqt ul.segmentedControl").css("list-style","none");
      $("#jqt ul.segmentedControl").css("overflow","hidden");
      $("#jqt ul.segmentedControl").css("padding-bottom","1px");
      $("#jqt ul.segmentedControl").css("text-align","center");
      $("#jqt ul.segmentedControl").css("-webkit-border-radius","8px");
      $("#jqt ul.segmentedControl li input[type=radio]").css("display","none");
      $("#jqt ul.segmentedControl li").css("border-left","0");
      $("#jqt ul.segmentedControl li").css("border-right","1px");
      $("#jqt ul.segmentedControl li").css("display","inline-block");
      $("#jqt ul.segmentedControl li").css("-webkit-border-radius","0");
      $("#jqt ul.segmentedControl li").css("-webkit-box-sizing","border-box");
      $("#jqt ul.segmentedControl li").css("-webkit-box-shadow","rgba(255,255,255,0.8) 0 1px 2px");
      $("#jqt ul.segmentedControl li").css("-webkit-tap-highlight-color","rgba(0,0,0,0)");
      $("#jqt ul.segmentedControl li label").css("color","#777");
      $("#jqt ul.segmentedControl li label").css("display","block");
      $("#jqt ul.segmentedControl li label").css("font-size","17px");
      $("#jqt ul.segmentedControl li label").css("font-weight","700");
      $("#jqt ul.segmentedControl li label").css("overflow","hidden");
      $("#jqt ul.segmentedControl li label").css("padding","0");
      $("#jqt ul.segmentedControl li label").css("position","relative");
      $("#jqt ul.segmentedControl li label").css("text-align","center");
      $("#jqt ul.segmentedControl li label").css("text-overflow","ellipsis");
      $("#jqt ul.segmentedControl li label").css("white-space","nowrap");
      $("#jqt ul.segmentedControl li.scSelected label").css("color","#f5f5f5");
      $("#jqt ul.segmentedControl li.scSelected label").css("text-shadow","none");
      $("#jqt ul.segmentedControl li:first-child").css("-webkit-border-radius","8px");
      $("#jqt ul.segmentedControl li:first-child").css("-webkit-border-bottom-right-radius","0");
      $("#jqt ul.segmentedControl li:first-child").css("-webkit-border-top-right-radius","0");
      $("#jqt ul.segmentedControl li:last-child").css("-webkit-border-radius","8px");
      $("#jqt ul.segmentedControl li:last-child").css("-webkit-border-bottom-left-radius","0");
      $("#jqt ul.segmentedControl li:last-child").css("-webkit-border-top-left-radius","0");
      $("#jqt ul.segmentedControl.two li").css("width","50%");
      $("#jqt ul.segmentedControl.three li").css("width","33.3%");
      $("#jqt ul.segmentedControl.four li").css("width","25%");
      $("#jqt ul.segmentedControl.five li").css("width","20%");
      $("#jqt ul.segmentedControl.six li").css("width","16.6%");      

      initSC = function () {
        $('.segmentedControl').children('li').click(function () {
          $(this).siblings().each(function () {
            $(this).removeClass('scSelected');
          })
          $($(this).children('input')).each(function () {
            this.checked = true;
            scName = $(this).attr('name');
            scValue = $(this).attr('value');
            if (scUseLocalStorage) {
              localStorage.setItem(scName, scValue);
              getSCValue();
            }
          });
          $(this).addClass('scSelected');
        });  
      };
      getSCValue = function(){
        return {
          scName: scName,
          scValue: scValue
        };
      };
      initSC();
      return {
        initSC: initSC,
        getSCValue: getSCValue
      };
    });
  }
})(jQuery);
