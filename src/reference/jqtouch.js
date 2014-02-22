(function() {

    $.jQTouch = function(options) {
        // Initialize internal jQT variables
        var $body,
            $head=$('head'),
            history=[],
            newPageCount=0,
            jQTSettings={},
            $currentPage='',
            orientation='portrait',
            touchSelectors=[],
            publicObj={},
            tapBuffer=100, // High click delay = ~350, quickest animation (slide) = 250
            extensions=$.jQTouch.prototype.extensions,
            extTapHandlers=$.jQTouch.prototype.tapHandlers,
            tapHandlers=[],
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
                icon4: null, // available in iOS 4.2 and later
                preloadImages: false,
                starter: $(document).ready,
                startupScreen: null,
                statusBar: 'default', // other options: black-translucent, black
                submitSelector: '.submit',
                touchSelector: 'a, .touch',
                trackScrollPositions: true,
                updateHash: true,
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
                    {name:'swapleft', selector:'.swapleft, .swap', is3d: true},
                    {name:'swapright', selector:'.swapright', is3d: true},
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

        function addTapHandler(tapHandler) {
            if (typeof(tapHandler.name) === 'string' && typeof(tapHandler.isSupported) === 'function' && typeof(tapHandler.fn) === 'function') {
                tapHandlers.push(tapHandler);
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

        // Unfortunately, we can not assume the 'tap' event
        // is being used for links, forms, etc.
        function clickHandler(e) {
            // Figure out whether to prevent default
            var $el = $(e.target);

            // Find the nearest tappable ancestor
            if (!$el.is(touchSelectors.join(', '))) {
                $el = $(e.target).closest(touchSelectors.join(', '));
            }

            // Prevent default if we found an internal link
            // (relative or absolute)
            if ($el && $el.attr('href') && !$el.isExternalLink()) {
                warn('Need to prevent default click behavior.');
                e.preventDefault();
            } else {
                warn('No need to prevent default click behavior.');
            }

            // Trigger a tap event if touchstart is not on the job
            if ($.support.touch) {
                warn('Not converting click to a tap event because touch handler is on the job.');
            } else {
                warn('Converting click event to a tap event because touch handlers are not present or off.');
                $(e.target).trigger('tap', e);
            }
        }

        function doNavigation(fromPage, toPage, animation, goingBack) {

            goingBack = goingBack ? goingBack : false;

            // Error check for target page
            if (toPage === undefined || toPage.length === 0) {
                $.fn.unselect();
                warn('Target element is missing.');
                return false;
            }

            // Error check for fromPage === toPage
            if (toPage.hasClass('current')) {
                $.fn.unselect();
                warn('You are already on the page you are trying to navigate to.');
                return false;
            }

            // Collapse the keyboard
            $(':focus').trigger('blur');

            fromPage.trigger('pageAnimationStart', { direction: 'out', back: goingBack });
            toPage.trigger('pageAnimationStart', { direction: 'in', back: goingBack });

            if ($.support.animationEvents && animation && jQTSettings.useAnimations) {
                // Fail over to 2d animation if need be
                if (!$.support.transform3d && animation.is3d) {
                    warn('Did not detect support for 3d animations, falling back to ' + jQTSettings.defaultAnimation + '.');
                    animation.name = jQTSettings.defaultAnimation;
                }

                // Reverse animation if need be
                var finalAnimationName = animation.name,
                    is3d = animation.is3d ? 'animating3d' : '';

                if (goingBack) {
                    finalAnimationName = finalAnimationName.replace(/left|right|up|down|in|out/, reverseAnimation);
                }

                warn('finalAnimationName is ' + finalAnimationName + '.');

                // Bind internal 'cleanup' callback
                fromPage.bind('webkitAnimationEnd', navigationEndHandler);

                // Trigger animations
                $body.addClass('animating ' + is3d);

                var lastScroll = window.pageYOffset;

                // Position the incoming page so toolbar is at top of
                // viewport regardless of scroll position on from page
                if (jQTSettings.trackScrollPositions === true) {
                    toPage.css('top', window.pageYOffset - (toPage.data('lastScroll') || 0));
                }

                toPage.addClass(finalAnimationName + ' in current');
                fromPage.removeClass('current').addClass(finalAnimationName + ' out inmotion');

                if (jQTSettings.trackScrollPositions === true) {
                    fromPage.data('lastScroll', lastScroll);
                    $('.scroll', fromPage).each(function() {
                        $(this).data('lastScroll', this.scrollTop);
                    });
                }
            } else {
                toPage.addClass('current in');
                fromPage.removeClass('current');
                navigationEndHandler();
            }

            // Housekeeping
            $currentPage = toPage;
            if (goingBack) {
                history.shift();
            } else {
                addPageToHistory($currentPage, animation);
            }
            setHash($currentPage.attr('id'));

            // Private navigationEnd callback
            function navigationEndHandler(event) {
                var bufferTime = tapBuffer;

                if ($.support.animationEvents && animation && jQTSettings.useAnimations) {
                    fromPage.unbind('webkitAnimationEnd', navigationEndHandler);
                    fromPage.removeClass(finalAnimationName + ' out inmotion');
                    if (finalAnimationName) {
                        toPage.removeClass(finalAnimationName);
                    }
                    $body.removeClass('animating animating3d');
                    if (jQTSettings.trackScrollPositions === true) {
                        toPage.css('top', -toPage.data('lastScroll'));

                        // Have to make sure the scroll/style resets
                        // are outside the flow of this function.
                        setTimeout(function() {
                            toPage.css('top', 0);
                            window.scroll(0, toPage.data('lastScroll'));
                            $('.scroll', toPage).each(function() {
                                this.scrollTop = - $(this).data('lastScroll');
                            });
                        }, 0);
                    }
                } else {
                    fromPage.removeClass(finalAnimationName + ' out inmotion');
                    if (finalAnimationName) {
                        toPage.removeClass(finalAnimationName);
                    }
                    bufferTime += 260;
                }

                // 'in' class is intentionally delayed,
                // as it is our ghost click hack
                setTimeout(function() {
                    toPage.removeClass('in');
                    window.scroll(0,0);
                }, bufferTime);

                fromPage.unselect();

                // Trigger custom events
                toPage.trigger('pageAnimationEnd', {
                    direction:'in',
                    animation: animation,
                    back: goingBack
                });
                fromPage.trigger('pageAnimationEnd', {
                    direction:'out',
                    animation: animation,
                    back: goingBack
                });
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
            if (history.length < 1) {
                warn('History is empty.');
            }

            if (history.length === 1) {
                warn('You are on the first panel.');
                window.history.go(-1);
            }

            var from = history[0],
                to = history[1];

            if (doNavigation(from.page, to.page, from.animation, true)) {
                return publicObj;
            } else {
                warn('Could not go back.');
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
                warn('Could not animate pages.');
                return false;
            }
        }

        function hashChangeHandler(e) {
            if (location.hash === history[0].hash) {
                warn('We are on the right panel.');
                return true;
            } else if (location.hash === '') {
                goBack();
                return true;
            } else if (history[1] && location.hash === history[1].hash) {
                goBack();
                return true;
            } else {
                // Lastly, just try going to the ID...
                warn('Could not find ID in history, just forwarding to DOM element.');
                goTo($(location.hash), jQTSettings.defaultAnimation);
            }
        }

        function initHairExtensions(options) {
            // Preload images
            if (jQTSettings.preloadImages) {
                for (var i = jQTSettings.preloadImages.length - 1; i >= 0; i--) {
                    (new Image()).src = jQTSettings.preloadImages[i];
                }
            }

            // Set appropriate icon
            // (retina display available in iOS 4.2 and later.)
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
                hairExtensions += '<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>';
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

        function initFXExtensions() {
            // Define public jQuery functions
            $.fn.isExternalLink = function() {
                var $el = $(this);
                return ($el.attr('target') === '_blank' || $el.attr('rel') === 'external' || $el.is('a[href^="http://maps.google.com"], a[href^="mailto:"], a[href^="tel:"], a[href^="javascript:"], a[href*="youtube.com/v"], a[href*="youtube.com/watch"]'));
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
                warn('Animation could not be found. Using ' + jQTSettings.defaultAnimation + '.');
                animation = jQTSettings.defaultAnimation;
            }
            return animation;
        }

        function insertPages(nodes, animation) {

            var targetPage = null;

            // Call dom.createElement element directly
            // instead of relying on $(nodes), to work around:
            // https://github.com/madrobby/zepto/issues/312
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
            scrollTo(0,0);
            orientation = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
            $body.removeClass('portrait landscape').addClass(orientation).trigger('turn', {orientation: orientation});
        }

        function setHash(hash) {
            // Sanitize
            if (jQTSettings.updateHash) {
                location.hash = '#' + hash.replace(/^#/, '');
            }
        }

        // Document ready stuff
        function start() {
            // Store some properties in a support object
            if (!$.support) $.support = {};
            $.support.animationEvents = (typeof window.WebKitAnimationEvent !== 'undefined');
            $.support.touch = (typeof window.TouchEvent !== 'undefined') && (window.navigator.userAgent.indexOf('Mobile') > -1) && jQTSettings.useFastTouch;
            $.support.transform3d = supportForTransform3d();
            $.support.ios5 = supportIOS5();

            if (!$.support.touch) {
                warn('This device does not support touch interaction, or it has been deactivated by the developer. Some features might be unavailable.');
            }
            if (!$.support.transform3d) {
                warn('This device does not support 3d animation. 2d animations will be used instead.');
            }

            // Add extensions
            for (var i=0, max=extensions.length; i < max; i++) {
                var fn = extensions[i];
                if ($.isFunction(fn)) {
                    $.extend(publicObj, fn(publicObj));
                }
            }

            // Add extensions tapHandlers
            for (var j=0, maxTapHandlers=extTapHandlers.length; j < maxTapHandlers; j++) {
                addTapHandler(extTapHandlers[j]);
            }
            // Add default tapHandlers
            addDefaultTapHandlers();

            // Add animations
            for (var k=0, maxAnimations=defaults.animations.length; k < maxAnimations; k++) {
                var animation = defaults.animations[k];
                if (jQTSettings[animation.name + 'Selector'] !== undefined) {
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
            var anatomyLessons = [];

            if ($body.length === 0) {
                warn('Could not find an element with the id "jqt", so the body id has been set to "jqt". If you are having any problems, wrapping your panels in a div with the id "jqt" might help.');
                $body = $(document.body).attr('id', 'jqt');
            }

            // Add some specific css if need be
            if ($.support.transform3d) {
                anatomyLessons.push('supports3d');
            }

            if (jQTSettings.useTouchScroll) {
                if ($.support.ios5) {
                    anatomyLessons.push('touchscroll');
                } else {
                    anatomyLessons.push('autoscroll');
                }
            }

            if (jQTSettings.fullScreenClass && window.navigator.standalone === true) {
                anatomyLessons.push(jQTSettings.fullScreenClass, jQTSettings.statusBar);
            }

            // Bind events
            $body
                .addClass(anatomyLessons.join(' '))
                .bind('click', clickHandler)
                .bind('orientationchange', orientationChangeHandler)
                .bind('submit', submitHandler)
                .bind('tap', tapHandler)
                .bind($.support.touch ? 'touchstart' : 'mousedown', touchStartHandler)
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

            if (href !== '#') {
                $.ajax({
                    url: href,
                    data: settings.data,
                    type: settings.method,
                    success: function (data) {
                        var firstPage = insertPages(data, settings.animation);
                        if (firstPage) {
                            if (settings.method === 'GET' && jQTSettings.cacheGetRequests === true && settings.$referrer) {
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
                    method: $form.attr('method') || 'POST',
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
                warn('No parent form found.');
            } else {
                warn('About to submit parent form.');
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
            warn('Support for 3d transforms: ' + result + '.');
            return result;
        }

        function supportIOS5() {
            var support = false;
            var REGEX_IOS_VERSION = /OS (\d+)(_\d+)* like Mac OS X/i;

            var agentString = window.navigator.userAgent;
            if (REGEX_IOS_VERSION.test(agentString)) {
                support = (REGEX_IOS_VERSION.exec(agentString)[1] >= 5);
            }
            return support;
        }

        function touchStartHandler(e) {

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
            $el.on($.support.touch ? 'touchmove' : 'mousemove', function() {
                $el.removeClass('active');
            });

            $el.on('touchend', function() {
                $el.unbind('touchmove mousemove');
            });
        }

        function tapHandler(e) {

            if (e.isDefaultPrevented()) {
                return true;
            }

            // Grab the target element
            var $el = $(e.target);

            // Find the nearest tappable ancestor
            if (!$el.is(touchSelectors.join(', '))) {
                $el = $el.closest(touchSelectors.join(', '));
            }

            // Make sure we have a tappable element
            if (!$el.length || !$el.attr('href')) {
                warn('Could not find a link related to tapped element.');
                return true;
            }

            // Init some vars
            var target = $el.attr('target'),
                hash = $el.prop('hash'),
                href = $el.attr('href');

            var params = {
                e: e,
                $el: $el,
                target: target,
                hash: hash,
                href: href,
                jQTSettings: jQTSettings
            };

            // Loop thru all handlers
            for (var i=0, len=tapHandlers.length; i<len; i++) {
                var handler = tapHandlers[i];
                var supported = handler.isSupported(e, params);
                if (supported) {
                    var flag = handler.fn(e, params);
                    return flag;
                }
            }
        }

        function addDefaultTapHandlers() {
            addTapHandler({
                name: 'external-link',
                isSupported: function(e, params) {
                    return params.$el.isExternalLink();
                },
                fn: function(e, params) {
                    params.$el.unselect();
                    return true;
                }
            });
            addTapHandler({
                name: 'back-selector',
                isSupported: function(e, params) {
                    return params.$el.is(params.jQTSettings.backSelector);
                },
                fn: function(e, params) {
                    // User clicked or tapped a back button
                    goBack(params.hash);
                }
            });
            addTapHandler({
                name: 'submit-selector',
                isSupported: function(e, params) {
                    return params.$el.is(params.jQTSettings.submitSelector);
                },
                fn: function(e, params) {
                    // User clicked or tapped a submit element
                    submitParentForm(params.$el);
                }
            });
            addTapHandler({
                name: 'webapp',
                isSupported: function(e, params) {
                    return params.target === '_webapp';
                },
                fn: function(e, params) {
                    // User clicked or tapped an internal link, fullscreen mode
                    window.location = params.href;
                    return false;
                }
            });
            addTapHandler({
                name: 'no-op',
                isSupported: function(e, params) {
                    return params.href === '#';
                },
                fn: function(e, params) {
                    // Allow tap on item with no href
                    params.$el.unselect();
                    return true;
                }
            });
            addTapHandler({
                name: 'standard',
                isSupported: function(e, params) {
                    return params.hash && params.hash !== '#';
                },
                fn: function(e, params) {
                    var animation = getAnimation(params.$el);
                    // Internal href
                    params.$el.addClass('active');
                    goTo(
                        $(params.hash).data('referrer', params.$el),
                        animation,
                        params.$el.hasClass('reverse')
                    );
                    return false;
                }
            });
            addTapHandler({
                name: 'external',
                isSupported: function(e, params) {
                    return true;
                },
                fn: function(e, params) {
                    var animation = getAnimation(params.$el);

                    // External href
                    params.$el.addClass('loading active');
                    showPageByHref(params.$el.attr('href'), {
                        animation: animation,
                        callback: function() {
                            params.$el.removeClass('loading');
                            setTimeout($.fn.unselect, 250, params.$el);
                        },
                        $referrer: params.$el
                    });
                    return false;
                }
            });
        }

        // Get the party started
        jQTSettings = $.extend({}, defaults, options);

        initHairExtensions(options);

        initFXExtensions();

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
        
        // must be called publicObj assignement to prevent timing problem with extension loading. 
        jQTSettings.starter(start);

        return publicObj;
    };

    $.jQTouch.prototype.extensions = [];
    $.jQTouch.prototype.tapHandlers = [];

    // Extensions directly manipulate the jQTouch object,
    // before it's initialized
    $.jQTouch.addExtension = function(extension) {
        $.jQTouch.prototype.extensions.push(extension);
    };

    // Experimental tap handlers that can bypass
    // default jQTouch tap handling
    $.jQTouch.addTapHandler = function(extension) {
        $.jQTouch.prototype.tapHandlers.push(extension);
    };

})(); // Double closure, ALL THE WAY ACROSS THE SKY
