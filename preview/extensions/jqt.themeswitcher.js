(function() {
  if ($.jQT) {
    $.jQT.addExtension(function(jQT) {
      var switchStyleSheet;
      $('[data-switch-stylesheet]').live('tap', function() {
        switchStyleSheet($(this).attr('data-stylesheet-title'), $(this).attr('data-switch-stylesheet'));
        $('[data-switch-stylesheet]').removeClass('selected');
        $(this).addClass('selected');
        return false;
      });
      switchStyleSheet = function(newStyleTitle, newStyle) {
        var $link, newHref;
        $link = $("link[title=\"" + newStyleTitle + "\"]");
        newHref = $link.length ? $link.attr('href') : newStyle;
        $('link[data-jqt-theme]').attr('href', newHref);
        return $('#jqt').attr('data-jqt-theme', newStyleTitle);
      };
      return {
        switchStyleSheet: switchStyleSheet
      };
    });
  }

}).call(this);
