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

        var scriptpath = $("script").last().attr("src").split('?')[0].split('/').slice(0, -1).join('/')+'/';
        var csspath = scriptpath + 'jqt.menusheet.css';

        var link = $('<link href="' + csspath + '" rel="stylesheet">');
        $('head').append($(link));

        function closemenu($source, $target) {
            $('#jqt').removeClass('menuopened');
            
            $source.addClass('passe');
            $target.addClass('passe').removeClass('current');
        }

        function openmenu($source, $target) {
            $source.one('touchstart mousedown', function() {
                closemenu($source, $target);
            });

            $source.addClass('passe');
            $target.addClass('current');
            $('#jqt').addClass('menuopened');
        }

        $.jQTouch.addExtension(function MenuSheet(jQT) {
            jQT.addTapHandler({
                name: 'open-menusheet',
                isSupported: function(e, params) {
                    return params.$el.is('.menu');
                },
                fn: function(e, params) {
                    params.$el.removeClass('active');

                    var $source = $($('.current')[0]);
                    var $target = $(params.hash);
                    openmenu($source, $target);

                    return false;
                }
            });
            return {};
        });
    }
})($);
