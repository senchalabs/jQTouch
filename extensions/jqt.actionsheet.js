/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>

    (c) 2012 by jQTouch project members.
    See LICENSE.txt for license.

    Author: Thomas Yip
*/

(function($) {
    if ($.jQTouch) {
        var src = $("head script").last().attr("src") || '';
        var scriptpath = src.split('?')[0].split('/').slice(0, -1).join('/')+'/';
        var csspath = scriptpath + 'jqt.actionsheet.css';

        var link = $('<link href="' + csspath + '" rel="stylesheet">');
        $('head').append($(link));

        $.jQTouch.addExtension(function ActionSheet(jQT) {
            jQT.addTapHandler({
                name: 'open-actionsheet',
                isSupported: function(e, params) {
                    return params.$el.is('.action');
                },
                fn: function(e, params) {
                    params.$el.removeClass('active');

                    var $source = $($('.current')[0]);
                    var $target = $(params.hash);
                    $target.one('webkitAnimationEnd', function() {
                        $target.removeClass('in slideup');                        
                    });

                    $source.addClass('smokedglass');
                    $target.data('referrer', params.$el);
                    $target.addClass('current in slideup');
                    return false;
                }
            });
            jQT.addTapHandler({
                name: 'close-actionsheet',
                isSupported: function(e, params) {
                    var $target = params.$el.closest('.current');
                    if ($target.length > 0) {
                        return params.$el.is('.actionsheet .actionchoices a');
                    }
                    return false;
                },
                fn: function(e, params) {
                    params.$el.removeClass('active');

                    var $target = params.$el.closest('.current');
                    $target.one('webkitAnimationEnd', function() {
                        $target.removeClass('current slidedown out');
                        $('.smokedglass').removeClass('smokedglass');

                        if (!params.$el.is('.dismiss')) {
                            params.$el.trigger('tap');
                        }
                    });
                    
                    $target.addClass('slidedown out');
                    return false;
                }
            });
            return {};
        });
    }
})($);
