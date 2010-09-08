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

*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function jqt_iscroll(jQT) {
      var iscroll_path = '../../extensions/jqt.iscroll/iscroll-min.js';
      
      $('.s-scrollwrapper').css('margin-bottom','30px');
      $('.s-scrollwrapper').css('position','relative');
      $('.s-scrollwrapper').css('z-index','1');
      
      findTabbar = function ($this){
        // Global Tab Bar
        if ($('#tabbar').length > 0) {
          $tabbar = $('#tabbar');
        }
  
        // Local Tab Bar - if it exists, it overrides global tab bar
        if ($('.tabbar', this).length > 0) {
          $tabbar = $('.tabbar', this);
        }
        return $tabbar;
      };

      // Begin setHeight()
      setHeight = function ($current_page) {
        var $navbar, navbarH, scroll, $tabbar, tabbarH, $wrapper, wrapperH;

        if (typeof $current_page === 'undefined' || $current_page === '') {
          $current_page = $('.current');
        }
        $current_page.each(function () {

          // Navigation Bar
          $navbar = $('.toolbar', this);
          navbarH = $navbar.length > 0 ? $navbar.outerHeight() : 0;

          $tabbar = findTabbar($(this));
          tabbarH = $tabbar.css('display') !== 'none' ? $tabbar.outerHeight() : 0;

          $wrapper = $('.s-scrollwrapper', this);
          wrapperH = window.innerHeight - navbarH - tabbarH;
          $wrapper.height(wrapperH);

          scroll = $(this).data('iscroll');
          if (typeof scroll !== 'null' && scroll !== 'undefined') {
            scroll.refresh();
          }
        });
      };
      // End setHeight()

      // Begin load_iScroll()
      load_iScroll = function ($page) {
        if (typeof $page === 'undefined' || $page === '') {
          $page = $('#jqt > div, #jqt > form').has('.s-scrollpane');
        }
        $page.each(function () {
          var scroll = new iScroll($('.s-scrollpane', this).attr('id'), {
            hScrollbar: false,
            checkDOMChanges: false,
            desktopCompatibility: true,
            snap: false
          });
          $(this).data('iscroll', scroll);

          // Scroll to the top of the page when <h1> is touched
          $('.toolbar h1', this).click(function () {
            scroll = $('.current').data('iscroll');
            scroll.scrollTo(0, 0, 0);
          });

          // Resize on animation event
          $(this).bind('pageAnimationEnd', function (e, data) {
            if (data.direction === 'in') {
              setHeight();
            }
          });
        });

        // Resize on rotation
        $('#jqt').bind('turn', function (e, data) {
          setHeight()
        });
      };
      // End load_iScroll()

      // Begin load iscroll.js
      $.getScript(iscroll_path, function () {
        load_iScroll();
        setHeight();
      });
      // End load iscroll.js
    });
  }
})(jQuery);