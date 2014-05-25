(function() {
  if ($.jQT) {
    $.jQT.addExtension(function(jQT) {
      $.fn.makeFloaty = function(options) {
        var settings;
        settings = $.extend({}, {
          align: 'top',
          spacing: 20,
          time: '.3s'
        }, options);
        if (settings.align !== 'top') {
          settings.align = 'bottom';
        }
        return this.each(function() {
          var $el;
          $el = $(this);
          $el.css({
            '-webkit-transition': 'top ' + settings.time + ' ease-in-out',
            'display': 'block',
            'min-height': '0 !important'
          }).data('settings', settings);
          $(document).scroll(function() {
            if ($el.data('floatyVisible')) {
              return $el.scrollFloaty();
            }
          });
          return $el.scrollFloaty();
        });
      };
      $.fn.scrollFloaty = function() {
        return this.each(function() {
          var $el, newY, settings, wHeight;
          $el = $(this);
          settings = $el.data('settings');
          wHeight = $('html').attr('clientHeight');
          newY = window.pageYOffset + (settings.align === 'top' ? settings.spacing : wHeight - settings.spacing - $el.get(0).offsetHeight);
          return $el.css('top', newY).data('floatyVisible', true);
        });
      };
      $.fn.hideFloaty = function() {
        return this.each(function() {
          var $el, oh;
          $el = $(this);
          oh = $el.get(0).offsetHeight;
          return $el.css('top', -oh - 10).data('floatyVisible', false);
        });
      };
      return $.fn.toggleFloaty = function() {
        return this.each(function() {
          var $el;
          $el = $(this);
          if ($el.data('floatyVisible')) {
            return $el.hideFloaty();
          } else {
            return $el.scrollFloaty();
          }
        });
      };
    });
  }

}).call(this);
