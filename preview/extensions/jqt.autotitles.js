(function() {
  if ($.jQT) {
    $.jQT.addExtension(function(jQT) {
      var titleSelector;
      titleSelector = '.toolbar h1';
      return $(function() {
        var setTitleSelector;
        $('#jqt').bind('pageAnimationStart', function(e, data) {
          var $el, $ref, $title;
          $el = $(e.target);
          if (data.direction === 'in') {
            $title = $(titleSelector, $el);
            $ref = $el.data('referrer');
            if ($title.length && $ref) {
              return $title.html($ref.text());
            }
          }
        });
        setTitleSelector = function(sel) {
          return titleSelector = sel;
        };
        return {
          setTitleSelector: setTitleSelector
        };
      });
    });
  }

}).call(this);
