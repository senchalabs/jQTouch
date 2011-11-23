/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>

    (c) 2011 by jQTouch project members.
    See LICENSE.txt for license.

*/

(function($) {
    if ($.jQTouch) {

        var scriptpath = $("script").last().attr("src").split('?')[0].split('/').slice(0, -1).join('/')+'/';

        $.jQTouch.addExtension(function ThemeSwitcher(jQT) {

            var current,
                link,
                titles = {},
                defaults = {
                    themeStyleSelector: 'link[rel="stylesheet"][title]',
                    themeIncluded: [
                        {title: 'jQTouch', href: scriptpath + '../themes/css/jqtouch.css'},
                        {title: 'Apple', href: scriptpath + '../themes/css/apple.css'}
                    ]
                },
                options = $.extend({}, defaults, jQT.settings);

            function setStyleState(item, title) {
                var $item = $(item);

                if ($item.attr('title') === title) {
                    item.disabled = false; // workaround for Firefox on Zepto
                    $item.removeAttr('disabled');
                } else {
                  item.disabled = true; // workaround for Firefox on Zepto
                  $item.attr('disabled', true);
                }
            };

            function initializeStyleState(item, title) {
              // and, workaround for WebKit by initializing the 'disabled' attribute
              if (!current) {
                  current = title;
              }
              setStyleState(item, current);
            }

            // public
            function switchStyle(title) {
                current = title;
                $(options.themeStyleSelector).each(function(i, item) {
                    setStyleState(item, title);
                });
            };

            // collect title names, from <head>
            $(options.themeStyleSelector).each(function(i, item) {
                var $item = $(item);
                var title = $item.attr('title');

                titles[title] = true;

                initializeStyleState(item, title);
            });

            // add included theme
            for (var i=0; i < options.themeIncluded.length; i++) {
                var hash = options.themeIncluded[i];
                if (!(hash.title in titles)) {
                    link = $('<link title="' + hash.title + '" href="' + hash.href + '" rel="stylesheet">');
                    $('head').append($(link));

                    titles[hash.title] = true;

                    initializeStyleState(link, hash.title);
                }
            }

            if (options.themeSelectionSelector) {
                // create UI items
                for (var title in titles) {
                    var $item = $('<li><a href="#" data-title="' + title + '">' + title + '</a></li>');
                    $(options.themeSelectionSelector).append($item);
                }

                // bind to UI items
                $(options.themeSelectionSelector).delegate('* > a', 'tap', function() {
                    var $a = $(this).closest('a');
                    switchStyle($a.attr('data-title'));

                    // poor-man simulation of radio button behaviour
                    setTimeout(function() {
                        $a.addClass('active');
                    }, 0);
                });

                // poor-man simulation of radio button behaviour
                $(options.themeSelectionSelector).closest('#jqt > *').bind('pageAnimationEnd', function(e, data){
                    if (data.direction === 'in') {
                        $(options.themeSelectionSelector).find('a[data-title="' + current + '"]').addClass('active');
                    }
                });
            }

            return {switchStyle: switchStyle};

        });
    }
})($);
