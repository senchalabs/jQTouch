/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Maintained by Thomas Yip <http://beedesk.com/>
    Sponsored by Sencha Labs <http://www.sencha.com/>
    Special thanks to Jonathan Stark <http://www.jonathanstark.com/>

    Documentation and issue tracking on GitHub <http://github.com/senchalabs/jQTouch/>

    (c) 2009-2011 Sencha Labs
    jQTouch may be freely distributed under the MIT license.

*/
(function() {

    jQTouchCore = function(options) {
        // Initialize internal jQT variables
        var $ = options.framework,
            $body,
            $head=$('head'),
            history=[],
            newPageCount=0,
            jQTSettings={},
            $currentPage='',
            orientation='portrait',
            touchSelectors=[],
            publicObj={},
            tapBuffer=150,
            extensions=jQTouchCore.prototype.extensions,
            animations=[],
            hairExtensions='',
            defaults = {
                addGlossToIcon: true,
                backSelector: '.back, .cancel, .goback',
                cacheGetRequests: true,
                debug: true,
                defaultAnimation: 'slideleft',
                fixedViewport: true,
                formSelector: 'form',
                fullScreen: true,
                fullScreenClass: 'fullscreen',
                icon: null,
                icon4: null, // available in iOS 4.2 and later.
                preloadImages: false,
                startupScreen: null,
                statusBar: 'default', // other options: black-translucent, black
                submitSelector: '.submit',
                touchSelector: 'a, .touch',
                trackScrollPositions: true,
                useAnimations: true,
                useFastTouch: true,
                useTouchScroll: true,
                animations: [ // highest to lowest priority
                    {name:'cubeleft', selector:'.cubeleft, .cube', is3d: true},
                    {name:'cuberight', selector:'.cuberight', is3d: true},
                    {name:'dissolve', selector:'.dissolve'},
                    {name:'fade', selector:'.fade'},
                    {name:'flipleft', selector:'.flipleft, .flip', is3d: true},
                    {name:'flipright', selector:'.flipright', is3d: true},
                    {name:'pop', selector:'.pop', is3d: true},
                    {name:'swapleft', selector:'.swap', is3d: true},
                    {name:'slidedown', selector:'.slidedown'},
                    {name:'slideright', selector:'.slideright'},
                    {name:'slideup', selector:'.slideup'},
                    {name:'slideleft', selector:'.slideleft, .slide, #jqt > * > ul li a'}
                ]
            }; // end defaults

        function warn(message) {
            if (window.console !== undefined && jQTSettings.debug === true) {
                console.warn(message);
            }
        }
        function addAnimation(animation) {
            if (typeof(animation.selector) === 'string' && typeof(animation.name) === 'string') {
                animations.push(animation);
            }
        }
        function addPageToHistory(page, animation) {
            history.unshift({
                page: page,
                animation: animation,
                hash: '#' + page.attr('id'),
                id: page.attr('id')
            });
        }

        // Unfortunately, we can not assume the "tap" event
        // is being used for links, forms, etc.
        function clickHandler(e) {

            // Figure out whether to prevent default
            var $el = $(e.target);

            // Find the nearest tappable ancestor
            if (!$el.is(touchSelectors.join(', '))) {
                $el = $(e.target).closest(touchSelectors.join(', '));
            }

            // Prevent default if we found an internal link (relative or absolute)
            if ($el && $el.attr('href') && !$el.isExternalLink()) {
                e.preventDefault();
            } else {
            }

            // Trigger a tap event if touchstart is not on the job
            if ($.support.touch) {
            } else {
                $(e.target).trigger('tap', e);
            }

        }
        function doNavigation(fromPage, toPage, animation, goingBack) {

            goingBack = goingBack ? goingBack : false;

            // Error check for target page
            if (toPage === undefined || toPage.length === 0) {
                $.fn.unselect();
                return false;
            }

            // Error check for fromPage===toPage
            if (toPage.hasClass('current')) {
                $.fn.unselect();
                return false;
            }

            // Collapse the keyboard
            $(':focus').trigger('blur');

            fromPage.trigger('pageAnimationStart', { direction: 'out', back: goingBack });
            toPage.trigger('pageAnimationStart', { direction: 'in', back: goingBack });

            if ($.support.animationEvents && animation && jQTSettings.useAnimations) {
                // Fail over to 2d animation if need be
                if (!$.support.transform3d && animation.is3d) {
                    animation.name = jQTSettings.defaultAnimation;
                }

                // Reverse animation if need be
                var finalAnimationName = animation.name,
                    is3d = animation.is3d ? 'animating3d' : '';

                if (goingBack) {
                    finalAnimationName = finalAnimationName.replace(/left|right|up|down|in|out/, reverseAnimation );
                }

                // Bind internal "cleanup" callback
                fromPage.bind('webkitAnimationEnd', navigationEndHandler);

                // Trigger animations
                $body.addClass('animating ' + is3d);

                var lastScroll = window.pageYOffset;

                // Position the incoming page so toolbar is at top of viewport regardless of scroll position on from page
                if (jQTSettings.trackScrollPositions === true) {
                    toPage.css('top', window.pageYOffset - (toPage.data('lastScroll') || 0));
                }
                
                toPage.addClass(finalAnimationName + ' in current');
                fromPage.addClass(finalAnimationName + ' out');

                if (jQTSettings.trackScrollPositions === true) {
                    fromPage.data('lastScroll', lastScroll);
                    $('.scroll', fromPage).each(function(){
                        $(this).data('lastScroll', this.scrollTop);
                    });
                }

            } else {
                toPage.addClass('current in');
                navigationEndHandler();
            }

            // Private navigationEnd callback
            function navigationEndHandler(event) {
                var bufferTime = tapBuffer;

                if ($.support.animationEvents && animation && jQTSettings.useAnimations) {
                    fromPage.unbind('webkitAnimationEnd', navigationEndHandler);
                    fromPage.removeClass('current ' + finalAnimationName + ' out');
                    toPage.removeClass(finalAnimationName);
                    $body.removeClass('animating animating3d');
                    if (jQTSettings.trackScrollPositions === true) {
                        toPage.css('top', -toPage.data('lastScroll'));

                        // Have to make sure the scroll/style resets
                        // are outside the flow of this function.
                        setTimeout(function(){
                            toPage.css('top', 0);
                            window.scroll(0, toPage.data('lastScroll'));
                            $('.scroll', toPage).each(function(){
                                this.scrollTop = - $(this).data('lastScroll');
                            });
                        }, 0);
                    }
                } else {
                    fromPage.removeClass(finalAnimationName + ' out current');
                    tapBuffer += 201;
                }

                // In class is intentionally delayed, as it is our ghost click hack
                setTimeout(function(){
                    toPage.removeClass('in');
                }, tapBuffer);

                // Housekeeping
                $currentPage = toPage;
                if (goingBack) {
                    history.shift();
                } else {
                    addPageToHistory($currentPage, animation);
                }

                fromPage.unselect();

                setHash($currentPage.attr('id'));

                // Trigger custom events
                toPage.trigger('pageAnimationEnd', { direction:'in', animation: animation});
                fromPage.trigger('pageAnimationEnd', { direction:'out', animation: animation});
            }

            return true;
        }
        function reverseAnimation(animation) {
            var opposites={
                'up' : 'down',
                'down' : 'up',
                'left' : 'right',
                'right' : 'left',
                'in' : 'out',
                'out' : 'in'
            };

            return opposites[animation] || animation;
        }
        function getOrientation() {
            return orientation;
        }
        function goBack() {

            // Error checking
            if (history.length < 1 ) {
            }

            if (history.length === 1 ) {
                window.history.go(-1);
            }

            var from = history[0],
                to = history[1];

            if (doNavigation(from.page, to.page, from.animation, true)) {
                return publicObj;
            } else {
                return false;
            }

        }
        function goTo(toPage, animation) {

            var fromPage = history[0].page;

            if (typeof animation === 'string') {
                for (var i=0, max=animations.length; i < max; i++) {
                    if (animations[i].name === animation) {
                        animation = animations[i];
                        break;
                    }
                }
            }

            if (typeof toPage === 'string') {
                var nextPage = $(toPage);

                if (nextPage.length < 1) {
                    showPageByHref(toPage, {
                        animation: animation
                    });
                    return;
                } else {
                    toPage = nextPage;
                }
            }
            if (doNavigation(fromPage, toPage, animation)) {
                return publicObj;
            } else {
                return false;
            }
        }
        function hashChangeHandler(e) {
            if (location.hash === history[0].hash) {
                return true;
            } else if (location.hash === '') {
                goBack();
                return true;
            } else {
                if( (history[1] && location.hash === history[1].hash) ) {
                    goBack();
                    return true;
                } else {
                    // Lastly, just try going to the ID...
                    goTo($(location.hash), jQTSettings.defaultAnimation);
                }
            }
        }
        function init(options) {
            jQTSettings = $.extend({}, defaults, options);

            // Preload images
            if (jQTSettings.preloadImages) {
                for (var i = jQTSettings.preloadImages.length - 1; i >= 0; i--) {
                    (new Image()).src = jQTSettings.preloadImages[i];
                }
            }

            // Set appropriate icon (retina display available in iOS 4.2 and later.)
            var precomposed = (jQTSettings.addGlossToIcon) ? '' : '-precomposed';
            if (jQTSettings.icon) {
                hairExtensions += '<link rel="apple-touch-icon' + precomposed + '" href="' + jQTSettings.icon + '" />';
            }
            if (jQTSettings.icon4) {
                hairExtensions += '<link rel="apple-touch-icon' + precomposed + '" sizes="114x114" href="' + jQTSettings.icon4 + '" />';
            }
            // Set startup screen
            if (jQTSettings.startupScreen) {
                hairExtensions += '<link rel="apple-touch-startup-image" href="' + jQTSettings.startupScreen + '" />';
            }

            // Set viewport
            if (jQTSettings.fixedViewport) {
                hairExtensions += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>';
            }

            // Set full-screen
            if (jQTSettings.fullScreen) {
                hairExtensions += '<meta name="apple-mobile-web-app-capable" content="yes" />';
                if (jQTSettings.statusBar) {
                    hairExtensions += '<meta name="apple-mobile-web-app-status-bar-style" content="' + jQTSettings.statusBar + '" />';
                }
            }

            // Attach hair extensions
            if (hairExtensions) {
                $head.prepend(hairExtensions);
            }
        }

        function getAnimation(el) {
            var animation;

            for (var i=0, max=animations.length; i < max; i++) {
                if (el.is(animations[i].selector)) {
                    animation = animations[i];
                    break;
                }
            }

            if (!animation) {
                animation = jQTSettings.defaultAnimation;
            }
            return animation;
        }

        function insertPages(nodes, animation) {

            var targetPage = null;

            // Call dom.createElement element directly instead of relying on $(nodes),
            // to work around: https://github.com/madrobby/zepto/issues/312
            var div = document.createElement('div');
            div.innerHTML = nodes;

            $(div).children().each(function(index, node) {
                var $node = $(this);
                if (!$node.attr('id')) {
                    $node.attr('id', 'page-' + (++newPageCount));
                }

                // Remove any existing instance
                $('#' + $node.attr('id')).remove();

                $body.append($node);
                $body.trigger('pageInserted', {page: $node});

                if ($node.hasClass('current') || !targetPage) {
                    targetPage = $node;
                }
            });
            if (targetPage !== null) {
                goTo(targetPage, animation);
                return targetPage;
            } else {
                return false;
            }
        }

        function orientationChangeHandler() {
            $body.css('minHeight', 1000);
            scrollTo(0,0);
            var bodyHeight = window.innerHeight;
            $body.css('minHeight', bodyHeight);

            orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
            $body.removeClass('portrait landscape').addClass(orientation).trigger('turn', {orientation: orientation});
        }
        function setHash(hash) {
            // Sanitize
            location.hash = '#' + hash.replace(/^#/, '');
        }
        function showPageByHref(href, options) {

            var defaults = {
                data: null,
                method: 'GET',
                animation: null,
                callback: null,
                $referrer: null
            };

            var settings = $.extend({}, defaults, options);

            if (href != '#') {
                $.ajax({
                    url: href,
                    data: settings.data,
                    type: settings.method,
                    success: function (data) {
                        var firstPage = insertPages(data, settings.animation);
                        if (firstPage) {
                            if (settings.method == 'GET' && jQTSettings.cacheGetRequests === true && settings.$referrer) {
                                settings.$referrer.attr('href', '#' + firstPage.attr('id'));
                            }
                            if (settings.callback) {
                                settings.callback(true);
                            }
                        }
                    },
                    error: function (data) {
                        if (settings.$referrer) {
                            settings.$referrer.unselect();
                        }
                        if (settings.callback) {
                            settings.callback(false);
                        }
                    }
                });
            } else if (settings.$referrer) {
                settings.$referrer.unselect();
            }
        }
        function submitHandler(e, callback) {

            $(':focus').trigger('blur');

            e.preventDefault();

            var $form = (typeof(e)==='string') ? $(e).eq(0) : (e.target ? $(e.target) : $(e));

            if ($form.length && $form.is(jQTSettings.formSelector) && $form.attr('action')) {
                showPageByHref($form.attr('action'), {
                    data: $form.serialize(),
                    method: $form.attr('method') || "POST",
                    animation: getAnimation($form),
                    callback: callback
                });
                return false;
            }
            return true;
        }
        function submitParentForm($el) {

            var $form = $el.closest('form');
            if ($form.length === 0) {
            } else {
                $form.trigger('submit');
                return false;
            }
            return true;
        }
        function supportForTransform3d() {

            var head, body, style, div, result;

            head = document.getElementsByTagName('head')[0];
            body = document.body;

            style = document.createElement('style');
            style.textContent = '@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-webkit-transform-3d){#jqt-3dtest{height:3px}}';

            div = document.createElement('div');
            div.id = 'jqt-3dtest';

            // Add to the page
            head.appendChild(style);
            body.appendChild(div);

            // Check the result
            result = div.offsetHeight === 3;

            // Clean up
            style.parentNode.removeChild(style);
            div.parentNode.removeChild(div);

            // Pass back result
            return result;
        }
        function touchStartHandler(e){

            var $el = $(e.target),
                selectors = touchSelectors.join(', ');

            // Find the nearest tappable ancestor
            if (!$el.is(selectors)) {
                $el = $el.closest(selectors);
            }

            // Make sure we have a tappable element
            if ($el.length && $el.attr('href')) {
                $el.addClass('active');
            }

            // Remove our active class if we move
            $el.on($.support.touch ? 'touchmove' : 'mousemove', function(){
                $el.removeClass('active');
            });

            $el.on('touchend', function(){
                $el.unbind('touchmove mousemove');
            });

        }
        function tapHandler(e){

            // Grab the target element
            var $el = $(e.target);

            // Find the nearest tappable ancestor
            if (!$el.is(touchSelectors.join(', '))) {
                $el = $el.closest(touchSelectors.join(', '));
            }

            // Make sure we have a tappable element
            if (!$el.length || !$el.attr('href')) {
                return false;
            }

            // Init some vars
            var target = $el.attr('target'),
                hash = $el.prop('hash'),
                href = $el.attr('href'),
                animation = null;

            if ($el.isExternalLink()) {
                $el.unselect();
                return true;

            } else if ($el.is(jQTSettings.backSelector)) {
                // User clicked or tapped a back button
                goBack(hash);

            } else if ($el.is(jQTSettings.submitSelector)) {
                // User clicked or tapped a submit element
                submitParentForm($el);

            } else if (target === '_webapp') {
                // User clicked or tapped an internal link, fullscreen mode
                window.location = href;
                return false;

            } else if (href === '#') {
                // Allow tap on item with no href
                $el.unselect();
                return true;
            } else {
                animation = getAnimation($el);

                if (hash && hash !== '#') {
                    // Internal href
                    $el.addClass('active');
                    goTo($(hash).data('referrer', $el), animation, $el.hasClass('reverse'));
                    return false;
                } else {
                    // External href
                    $el.addClass('loading active');
                    showPageByHref($el.attr('href'), {
                        animation: animation,
                        callback: function() {
                            $el.removeClass('loading');
                            setTimeout($.fn.unselect, 250, $el);
                        },
                        $referrer: $el
                    });
                    return false;
                }
            }
        }

        // Get the party started
        init(options);

        // Document ready stuff
        $(document).ready(function RUMBLE() {

            // Store some properties in a support object
            if (!$.support) $.support = {};
            $.support.animationEvents = (typeof window.WebKitAnimationEvent != 'undefined');
            $.support.touch = (typeof window.TouchEvent != 'undefined') && (window.navigator.userAgent.indexOf('Mobile') > -1) && jQTSettings.useFastTouch;
            $.support.transform3d = supportForTransform3d();

            $.support.ios5 = /OS (5(_\d+)*) like Mac OS X/i.test(window.navigator.userAgent);

            if (!$.support.touch) {
            }
            if (!$.support.transform3d) {
            }

            // Define public jQuery functions
            $.fn.isExternalLink = function() {
                var $el = $(this);
                return ($el.attr('target') == '_blank' || $el.attr('rel') == 'external' || $el.is('a[href^="http://maps.google.com"], a[href^="mailto:"], a[href^="tel:"], a[href^="javascript:"], a[href*="youtube.com/v"], a[href*="youtube.com/watch"]'));
            };
            $.fn.makeActive = function() {
                return $(this).addClass('active');
            };
            $.fn.unselect = function(obj) {
                if (obj) {
                    obj.removeClass('active');
                } else {
                    $('.active').removeClass('active');
                }
            };

            // Add extensions
            for (var i=0, max=extensions.length; i < max; i++) {
                var fn = extensions[i];
                if ($.isFunction(fn)) {
                    $.extend(publicObj, fn(publicObj));
                }
            }

            // Add animations
            for (var j=0, max_anims=defaults.animations.length; j < max_anims; j++) {
                var animation = defaults.animations[j];
                if(jQTSettings[animation.name + 'Selector'] !== undefined){
                    animation.selector = jQTSettings[animation.name + 'Selector'];
                }
                addAnimation(animation);
            }

            // Create an array of stuff that needs touch event handling
            touchSelectors.push(jQTSettings.touchSelector);
            touchSelectors.push(jQTSettings.backSelector);
            touchSelectors.push(jQTSettings.submitSelector);
            $(touchSelectors.join(', ')).css('-webkit-touch-callout', 'none');

            // Make sure we have a jqt element
            $body = $('#jqt');
            var anatomy_lessons = [];

            if ($body.length === 0) {
                $body = $(document.body).attr('id', 'jqt');
            }

            // Add some specific css if need be
            if ($.support.transform3d) {
                anatomy_lessons.push('supports3d');
            }
            if ($.support.ios5 && jQTSettings.useTouchScroll) {
                anatomy_lessons.push('touchscroll');
            }

            if (jQTSettings.fullScreenClass && window.navigator.standalone === true) {
                anatomy_lessons.push(jQTSettings.fullScreenClass, jQTSettings.statusBar);
            }

            // Bind events
            
            $body
                .addClass(anatomy_lessons.join(' '))
                .bind('click', clickHandler)
                .bind('orientationchange', orientationChangeHandler)
                .bind('submit', submitHandler)
                .bind('tap', tapHandler)
                .bind( $.support.touch ? 'touchstart' : 'mousedown', touchStartHandler)
                .trigger('orientationchange');
            
            $(window).bind('hashchange', hashChangeHandler);

            var startHash = location.hash;

            // Determine what the initial view should be
            if ($('#jqt > .current').length === 0) {
                $currentPage = $('#jqt > *:first-child').addClass('current');
            } else {
                $currentPage = $('#jqt > .current');
            }
            
            setHash($currentPage.attr('id'));
            addPageToHistory($currentPage);

            if ($(startHash).length === 1) {
                goTo(startHash);
            }
        });

        // Expose public methods and properties
        publicObj = {
            addAnimation: addAnimation,
            animations: animations,
            getOrientation: getOrientation,
            goBack: goBack,
            insertPages: insertPages,
            goTo: goTo,
            history: history,
            settings: jQTSettings,
            submitForm: submitHandler
        };
        return publicObj;
    };
    
    jQTouchCore.prototype.extensions = [];

    // If Zepto exists, jQTouch will use Zepto. Otherwise, a bridge should initialize
    // jQTouch. See jqtouch-jquery.js.
    if (!!window.Zepto) {
        (function($) {
            $.jQTouch = function(options) {
                options.framework = $;
                return jQTouchCore(options);
            };

            $.fn.prop = $.fn.attr;
            
            // Extensions directly manipulate the jQTouch object, before it's initialized.
            $.jQTouch.addExtension = function(extension) {
                jQTouchCore.prototype.extensions.push(extension);
            };
        })(Zepto);
    }
})(); // Double closure, ALL THE WAY ACROSS THE SKY
