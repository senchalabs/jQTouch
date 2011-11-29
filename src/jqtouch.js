/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Maintained by Jonathan Stark <http://jonathanstark.com/>
    Sponsored by Sencha Labs <http://www.sencha.com/>

    Documentation and issue tracking on GitHub <http://wiki.github.com/senchalabs/jQTouch/>

    (c) 2009-2011 by jQTouch project members.
    See LICENSE.txt for license.

*/
(function() {

    jQTouchCore = function(options) {
        // Initialize internal jQT variables
        var $ = options.framework,
            $body,
            $head=$('head'),
            hist=[],
            newPageCount=0,
            jQTSettings={},
            $currentPage='',
            orientation='portrait',
            tapReady=true,
            lastAnimationTime=0,
            touchSelectors=[],
            publicObj={},
            tapBuffer=351,
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
                useAnimations: true,
                useFastTouch: true,
                useTouchScroll: true,
                animations: [ // highest to lowest priority
                    {selector:'.cubeleft, .cube', name:'cubeleft', is3d: true},
                    {selector:'.cuberight', name:'cuberight', is3d: true},
                    {selector:'.dissolve', name:'dissolve'},
                    {selector:'.fade', name:'fade'},
                    {selector:'.flipleft, .flip', name:'flipleft', is3d: true},
                    {selector:'.flipright', name:'flipright', is3d: true},
                    {selector:'.pop', name:'pop', is3d: true},
                    {selector:'.slidedown', name:'slidedown'},
                    {selector:'.slideleft, .slide, #jqt > * > ul li a', name:'slideleft'},
                    {selector:'.slideright', name:'slideright'},
                    {selector:'.slideup', name:'slideup'},
                    {selector:'.swap', name:'swapleft', is3d: true}
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
            hist.unshift({
                page: page,
                animation: animation,
                hash: '#' + page.attr('id'),
                id: page.attr('id')
            });
        }

        // Unfortunately, we can not assume the "tap" event
        // is being used for links, forms, etc.
        function clickHandler(e) {

            if (!tapReady) {
                warn('ClickHandler handler aborted because tap is not ready');
                e.preventDefault();
                return false;
            }

            // Figure out whether to prevent default
            var $el = $(e.target);

            // Find the nearest tappable ancestor
            if (!$el.is(touchSelectors.join(', '))) {
                $el = $(e.target).closest(touchSelectors.join(', '));
            }

            // Prevent default if we found an internal link (relative or absolute)
            if ($el && $el.attr('href') && !$el.isExternalLink()) {
                warn('Need to prevent default click behavior');
                e.preventDefault();
            } else {
                warn('No need to prevent default click behavior');
            }

            // Trigger a tap event if touchstart is not on the job
            if ($.support.touch) {
                warn('Not converting click to a tap event because touch handler is on the job');
            } else {
                warn('Converting click event to a tap event because touch handlers are not present or off');
                $(e.target).trigger('tap', e);
            }

        }
        function doNavigation(fromPage, toPage, animation, goingBack) {

            // Error check for target page
            if (toPage === undefined || toPage.length === 0) {
                $.fn.unselect();
                warn('Target element is missing.');
                return false;
            }

            // Error check for fromPage===toPage
            if (toPage.hasClass('current')) {
                $.fn.unselect();
                warn('You are already on the page you are trying to navigate to.');
                return false;
            }

            // Collapse the keyboard
            $(':focus').trigger('blur');

            // Position the incoming page so toolbar is at top of viewport regardless of scroll position on from page
            // toPage.css('top', window.pageYOffset);

            fromPage.trigger('pageAnimationStart', { direction: 'out' });
            toPage.trigger('pageAnimationStart', { direction: 'in' });

            if ($.support.animationEvents && animation && jQTSettings.useAnimations) {

                tapReady = false;

                // Fail over to 2d animation if need be
                if (!$.support.transform3d && animation.is3d) {
                    warn('Did not detect support for 3d animations, falling back to ' + jQTSettings.defaultAnimation);
                    animation.name = jQTSettings.defaultAnimation;
                }

                // Reverse animation if need be
                var finalAnimationName = animation.name;

                if (goingBack) {
                    finalAnimationName = finalAnimationName.replace(/left|right|up|down|in|out/, reverseAnimation );
                }

                warn('finalAnimationName is ' + finalAnimationName);

                // Bind internal "cleanup" callback
                fromPage.bind('webkitAnimationEnd', navigationEndHandler);

                // Trigger animations
                scrollTo(0, 0);
                toPage.addClass(finalAnimationName + ' in current');
                fromPage.addClass(finalAnimationName + ' out');

            } else {
                toPage.addClass('current');
                navigationEndHandler();
            }

            // Define private navigationEnd callback
            function navigationEndHandler(event) {
                if ($.support.animationEvents && animation && jQTSettings.useAnimations) {
                    fromPage.unbind('webkitAnimationEnd', navigationEndHandler);
                    fromPage.removeClass('current ' + finalAnimationName + ' out');
                    toPage.removeClass(finalAnimationName + ' in');
                    // scrollTo(0, 0);
                    // toPage.css('top', 0);
                } else {
                    fromPage.removeClass(finalAnimationName + ' out current');
                }

                // Housekeeping
                $currentPage = toPage;
                if (goingBack) {
                    hist.shift();
                } else {
                    addPageToHistory($currentPage, animation);
                }

                fromPage.unselect();
                lastAnimationTime = (new Date()).getTime();
                setHash($currentPage.attr('id'));
                tapReady = true;

                // Trigger custom events
                toPage.trigger('pageAnimationEnd', {direction:'in', animation:animation});
                fromPage.trigger('pageAnimationEnd', {direction:'out', animation:animation});
            }

            // We's out
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
            if (hist.length < 1 ) {
                warn('History is empty.');
            }

            if (hist.length === 1 ) {
                warn('You are on the first panel.');
                history.go(-1);
            }

            var from = hist[0], to = hist[1];

            if (doNavigation(from.page, to.page, from.animation, true)) {
                return publicObj;
            } else {
                warn('Could not go back.');
                return false;
            }

        }
        function goTo(toPage, animation, reverse) {

            if (reverse) {
                warn('The reverse parameter of the goTo() function has been deprecated.');
            }

            var fromPage = hist[0].page;

            if (typeof animation === 'string') {
                for (var i=0, max=animations.length; i < max; i++) {
                    if (animations[i].name === animation) {
                        animation = animations[i];
                        break;
                    }
                }
            }

            if (typeof(toPage) === 'string') {
                var nextPage = $(toPage);
                if (nextPage.length < 1) {
                    showPageByHref(toPage, {
                        'animation': animation
                    });
                    return;
                } else {
                    toPage = nextPage;
                }

            }
            if (doNavigation(fromPage, toPage, animation)) {
                return publicObj;
            } else {
                warn('Could not animate pages.');
                return false;
            }
        }
        function hashChangeHandler(e) {
            if (location.hash === hist[0].hash) {
                warn('We are on the right panel');
            } else {
                warn('We are not on the right panel');
                if(location.hash === hist[1].hash) {
                    goBack();
                } else {
                    warn(location.hash + ' !== ' + hist[1].hash);
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
                hairExtensions += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no;"/>';
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
        function mousedownHandler(e) {
            var timeDiff = (new Date()).getTime() - lastAnimationTime;
            if (timeDiff < tapBuffer) {
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

            // Trim leading # if need be
            hash = hash.replace(/^#/, '');

            // Change hash
            location.hash = '#' + hash;
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

            warn($form.attr('action'));

            if ($form.length && $form.is(jQTSettings.formSelector) && $form.attr('action')) {
                showPageByHref($form.attr('action'), {
                    data: $form.serialize(),
                    method: $form.attr('method') || "POST",
                    animation: animations[0] || null,
                    callback: callback
                });
                return false;
            }
            return false;
        }
        function submitParentForm($el) {

            var $form = $el.closest('form');
            if ($form.length === 0) {
                warn('No parent form found');
            } else {
                warn('About to submit parent form');
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
            warn('Support for 3d transforms: ' + result);
            return result;
        }
        function touchStartHandler(e){
            var $el = $(e.target);

            // Find the nearest tappable ancestor
            if (!$el.is(touchSelectors.join(', '))) {
                $el = $(e.target).closest(touchSelectors.join(', '));
            }

            // Make sure we have a tappable element
            if ($el.length && $el.attr('href')) {
                $el.addClass('active');
            }

            $el.on('touchmove', function(){
                $el.removeClass('active');
            });
        }
        function tapHandler(e){

            if (!tapReady) {
                warn('Tap is not ready');
                return false;
            }

            // Grab the target element
            var $el = $(e.target);

            // Find the nearest tappable ancestor
            if (!$el.is(touchSelectors.join(', '))) {
                $el = $(e.target).closest(touchSelectors.join(', '));
            }

            // Make sure we have a tappable element
            if (!$el.length || !$el.attr('href')) {
                warn('Could not find a link related to tapped element');
                return false;
            }

            // Init some vars
            var target = $el.attr('target'),
                hash = $el.attr('hash'),
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
                window.location = $el.attr('href');
                return false;

            } else if ($el.attr('href') === '#') {
                // Allow tap on item with no href
                $el.unselect();
                return true;
            } else {
                // Figure out the animation to use
                for (var i=0, max=animations.length; i < max; i++) {
                    if ($el.is(animations[i].selector)) {
                        animation = animations[i];
                        break;
                    }
                }

                if (!animation) {
                    warn('Animation could not be found. Using ' + jQTSettings.defaultAnimation + '.');
                    animation = jQTSettings.defaultAnimation;
                }

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
            $.support = {};
            $.support.animationEvents = (typeof window.WebKitAnimationEvent != 'undefined');
            $.support.touch = (typeof window.TouchEvent != 'undefined') && (window.navigator.userAgent.indexOf('Mobile') > -1) && jQTSettings.useFastTouch;
            $.support.transform3d = supportForTransform3d();

            $.support.ios5 = /OS (5(_\d+)*) like Mac OS X/i.test(window.navigator.userAgent);

            if (!$.support.touch) {
                warn('This device does not support touch interaction, or it has been deactivated by the developer. Some features might be unavailable.');
            }
            if (!$.support.transform3d) {
                warn('This device does not support 3d animation. 2d animations will be used instead.');
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

            for (var j=0, max_anims=defaults.animations.length; j < max_anims; j++) {
                var animation = defaults.animations[j];
                if(jQTSettings[animation.name + 'Selector'] !== undefined){
                    animation.selector = jQTSettings[animation.name + 'Selector'];
                }
                addAnimation(animation);
            }

            // Create an array of stuff that needs touch event handling
            // touchSelectors.push('input');
            touchSelectors.push(jQTSettings.touchSelector);
            touchSelectors.push(jQTSettings.backSelector);
            touchSelectors.push(jQTSettings.submitSelector);
            $(touchSelectors.join(', ')).css('-webkit-touch-callout', 'none');

            // Make sure we have a jqt element
            $body = $('#jqt');

            if ($body.length === 0) {
                warn('Could not find an element with the id "jqt", so the body id has been set to "jqt". If you are having any problems, wrapping your panels in a div with the id "jqt" might help.');
                $body = $('body').attr('id', 'jqt');
            }

            // Add some specific css if need be
            if ($.support.transform3d) {
                $body.addClass('supports3d');
            }
            if ($.support.ios5) {
                $body.addClass('ios5');
            }
            if (jQTSettings.fullScreenClass && window.navigator.standalone === true) {
                $body.addClass(jQTSettings.fullScreenClass + ' ' + jQTSettings.statusBar);
            }

            // Bind events
            $(window).bind('hashchange', hashChangeHandler);
            $body
                .bind('click', clickHandler)
                .bind('mousedown', mousedownHandler)
                .bind('orientationchange', orientationChangeHandler)
                .bind('submit', submitHandler)
                .bind('tap', tapHandler)
                .bind('touchstart', touchStartHandler)
                .trigger('orientationchange');

            // Determine what the "current" (initial) panel should be

            if ($('#jqt > .current').length === 0) {
                $currentPage = $('#jqt > *:first-child').addClass('current');
            } else {
                $currentPage = $('#jqt > .current');
            }
            
            setHash($currentPage.attr('id'));

            addPageToHistory($currentPage);
        });

        // Expose public methods and properties
        publicObj = {
            addAnimation: addAnimation,
            animations: animations,
            getOrientation: getOrientation,
            goBack: goBack,
            goTo: goTo,
            hist: hist,
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
            
            // Extensions directly manipulate the jQTouch object, before it's initialized.
            $.jQTouch.addExtension = function(extension) {
                jQTouchCore.prototype.extensions.push(extension);
            };
        })(Zepto);
    }
})(); // Double closure, ALL THE WAY ACROSS THE SKY
