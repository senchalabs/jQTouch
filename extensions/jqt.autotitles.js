(function($) {
    if ($.jQT)
    {
        $.jQT.addExtension(function AutoTitles(jQT){
            
            var titleSelector='.toolbar h1';

            $(function(){
                $('#jqt').bind('pageAnimationStart', function(e, data){
                    console.log('WHAT?!');
                    if (data.direction === 'in'){
                        var $title = $(titleSelector, $(e.target));
                        var $ref = $(e.target).data('referrer');
                        if ($title.length && $ref && $title.text() === ''){
                            $title.html($ref.text());
                        }
                    }
                });
            });
            
            function setTitleSelector(ts){
                titleSelector=ts;
            }
            
            return {
                setTitleSelector: setTitleSelector
            };

        });
    }
})($);
