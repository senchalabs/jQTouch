/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Documentation and issue tracking on GitHub <http://wiki.github.com/senchalabs/jQTouch/>

    Special thanks to Jonathan Stark <http://jonathanstark.com/>
    and pinch/zoom <http://www.pinchzoom.com/>

    (c) 2010 by jQTouch project members.
    See LICENSE.txt for license.

    $Revision: 150 $
    $Date: Tue Oct 19 13:10:44 EDT 2010 $
    $LastChangedBy: jonathanstark $

*/

(function($) {
    $.jQTouch = function(options) {

        // Initialize internal jQT variables
        var $body,
            $head=$('head'),
            initialPageId='',
            hist=[],
            newPageCount=0,
            jQTSettings={},
            currentPage='',
            orientation='portrait',
            tapReady=true,
            lastAnimationTime=0,
            touchSelectors=[],
            publicObj={},
            tapBuffer=351,
            extensions=$.jQTouch.prototype.extensions,
            animations=[],
            hairExtensions='', 
            defaults = {
                addGlossToIcon: true,
                backSelector: '.back, .cancel, .goback',
                cacheGetRequests: true,
                debug: true,
                fallback2dAnimation: 'fade', 
                fixedViewport: true,
                formSelector: 'form',
                fullScreen: true,
                fullScreenClass: 'fullscreen',
                hoverDelay: 150,
                icon: null,
                icon4: null, // experimental
                moveThreshold: 10,
                preloadImages: false,
                pressDelay: 1000,
                startupScreen: null,
                statusBar: 'default', // other options: black-translucent, black
                submitSelector: '.submit',
                touchSelector: 'a, .touch',
                unloadMessage: 'Are you sure you want to leave this page? Doing so will log you out of the app.', 
                useAnimations: true,
                useTouch: true, // experimental 
                animations: [ // highest to lowest priority
                    {selector:'.cube', name:'cubeleft', is3d:true},
                    {selector:'.cubeleft', name:'cubeleft', is3d:true},
                    {selector:'.cuberight', name:'cuberight', is3d:true},
                    {selector:'.dissolve', name:'fade', is3d:false},
                    {selector:'.fade', name:'fade', is3d:false},
                    {selector:'.flip', name:'flipleft', is3d:true},
                    {selector:'.flipleft', name:'flipleft', is3d:true},
                    {selector:'.flipright', name:'flipright', is3d:true},
                    {selector:'.pop', name:'pop', is3d:true},
                    {selector:'.slide', name:'slideleft', is3d:false},
                    {selector:'.slidedown', name:'slidedown', is3d:false},
                    {selector:'.slideleft', name:'slideleft', is3d:false},
                    {selector:'.slideright', name:'slideright', is3d:false},
                    {selector:'.slideup', name:'slideup', is3d:false},
                    {selector:'.swap', name:'swapleft', is3d:true},
                    {selector:'#jqt > * > ul li a', name:'slideleft', is3d:false}
                ]
            };
        
        function _debug(message) {
            if (jQTSettings.debug) {
                if (message) {
                    console.log(message);
                } else {
                    console.log('Called ' + arguments.callee.caller.name);
                }
            }
        }
        function addAnimation(animation) {
            _debug();
            if (typeof(animation.selector) === 'string' && typeof(animation.name) === 'string') {
                animations.push(animation);
            }
        }
        function addPageToHistory(page, animation, reverse) {
            _debug();
            hist.unshift({
                page: page,
                animation: animation,
                id: page.attr('id')
            });
        }
        function clickHandler(e) {
            _debug();
            
            // Prevent the default click behavior for links
            if (e.target.nodeName === 'A') {
                e.preventDefault();
            }

            // Convert the click to a tap
            $(e.target).trigger('tap');
            
        }
        function doNavigation(fromPage, toPage, animation, backwards) {
            _debug();
            // _debug('animation.name: ' + animation.name + '; backwards: ' + backwards);

            // Error check for target page
            if (toPage.length === 0) {
                $.fn.unselect();
                _debug('Target element is missing.');
                return false;
            }

            // Error check for fromPage===toPage
            if (toPage.hasClass('current')) {
                $.fn.unselect();
                _debug('You are already on the page you are trying to navigate to.');
                return false;
            }

            // Collapse the keyboard
            $(':focus').blur();

            // Make sure we are scrolled up to hide location bar
            // toPage.css('top', window.pageYOffset);

            // fromPage.trigger('pageAnimationStart', { direction: 'out' });
            // toPage.trigger('pageAnimationStart', { direction: 'in' });

            if ($.support.animationEvents && animation && jQTSettings.useAnimations) {

                tapReady = false;

                // Fail over to 2d animation if need be
                if (!$.support.transform3d && animation.is3d) {
                    animation.name = jQTSettings.fallback2dAnimation;
                }
                
                // Reverse animation if need be
                if (backwards) {
                    if (animation.name.indexOf('left') > 0) {
                        finalAnimationName = animation.name.replace(/left/, 'right');
                    } else if (animation.name.indexOf('right') > 0) {
                        finalAnimationName = animation.name.replace(/right/, 'left');
                    } else if (animation.name.indexOf('up') > 0) {
                        finalAnimationName = animation.name.replace(/up/, 'down');
                    } else if (animation.name.indexOf('down') > 0) {
                        finalAnimationName = animation.name.replace(/down/, 'up');
                    }
                } else {
                    finalAnimationName = animation.name;
                }
                
                // Bind internal "cleanup" callback
                fromPage.bind('webkitAnimationEnd', navigationEndHandler);
                
                // Trigger animations
                toPage.addClass(finalAnimationName + ' in current');
                fromPage.addClass(finalAnimationName + ' out');

            } else {
                toPage.addClass('current');
                navigationEndHandler();
            }
            
            // Define private navigationEnd callback
            function navigationEndHandler(event) {
                _debug();

                if ($.support.animationEvents && animation && jQTSettings.useAnimations) {
                    fromPage.unbind('webkitAnimationEnd', navigationEndHandler);
                    fromPage.attr('class', '');
                    toPage.attr('class', 'current');
                    // toPage.css('top', 0);
                } else {
                    fromPage.attr('class', '');
                }

                // Housekeeping
                currentPage = toPage;
                if (backwards) {
                    hist.shift();
                } else {
                    addPageToHistory(currentPage, animation);
                }
                
                fromPage.unselect();
                lastAnimationTime = (new Date()).getTime();
                setHash(currentPage.attr('id'));
                tapReady = true;

                // Finally, trigger custom events
                toPage.trigger('pageAnimationEnd', {direction:'in', animation:animation});
                fromPage.trigger('pageAnimationEnd', {direction:'out', animation:animation});

            }
            
            // We's out
            return true;
        }
        function getOrientation() {
            _debug();
            return orientation;
        }
        function goBack() {
            _debug();

            // Error checking
            if (hist.length < 1 ) {
                _debug('History is empty.');
            }
            
            if (hist.length === 1 ) {
                _debug('You are on the first panel.');
            }
            
            var from = hist[0],
                to = hist[1];

            if (doNavigation(from.page, to.page, from.animation, true)) {
                return publicObj;
            } else {
                _debug('Could not go back.');
                return false;
            }
            
            // Prevent default behavior
            return false;
        }
        function goTo(toPage, animation, reverse) {
            _debug();

            if (reverse) {
                console.warn('The reverse parameter was sent to goTo() function, which is bad.');
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
                nextPage = $(toPage);
                if (nextPage.length < 1) {
                    showPageByHref(toPage, {
                        'animation': animation
                    });
                    return;
                } else {
                    toPage = nextPage;
                }
                
            }
            if (doNavigation(fromPage, toPage, animation, reverse)) {
                return publicObj;
            } else {
                _debug('Could not animate pages.');
                return false;
            }
        }
        function hashChange(e) {
            _debug();
            if (location.href == hist[1].href) {
                goBack();
            } else {
                _debug(location.href+' == '+hist[1].href);
            }
        }
        function init(options) {
            _debug();
            jQTSettings = $.extend({}, defaults, options);

            // Preload images
            if (jQTSettings.preloadImages) {
                for (var i = jQTSettings.preloadImages.length - 1; i >= 0; i--) {
                    (new Image()).src = jQTSettings.preloadImages[i];
                };
            }

            // Set appropriate icon (retina display stuff is experimental)
            if (jQTSettings.icon || jQTSettings.icon4) {
                var precomposed, appropriateIcon;
                if (jQTSettings.icon4 && window.devicePixelRatio && window.devicePixelRatio === 2) {
                    appropriateIcon = jQTSettings.icon4;
                } else if (jQTSettings.icon) {
                    appropriateIcon = jQTSettings.icon;
                } else {
                    appropriateIcon = false;
                }
                if (appropriateIcon) {
                    precomposed = (jQTSettings.addGlossToIcon) ? '' : '-precomposed';
                    hairExtensions += '<link rel="apple-touch-icon' + precomposed + '" href="' + appropriateIcon + '" />';
                }
            }

            // Set startup screen
            if (jQTSettings.startupScreen) {
                hairExtensions += '<link rel="apple-touch-startup-image" href="' + jQTSettings.startupScreen + '" />';
            }

            // Set viewport
            if (jQTSettings.fixedViewport) {
                hairExtensions += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;"/>';
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
            _debug();

            var targetPage = null;
            $(nodes).each(function(index, node) {
                var $node = $(this);
                if (!$node.attr('id')) {
                    $node.attr('id', 'page-' + (++newPageCount));
                }

		        $body.trigger('pageInserted', {page: $node.appendTo($body)});

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
            _debug();

            orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
            $body.removeClass('portrait landscape').addClass(orientation).trigger('turn', {orientation: orientation});
        }
        function setHash(hash) {
            _debug();
            
            return; // Deactivated at the moment
            
            // trim leading # if need be
            hash = hash.replace(/^#/, ''),
            
            // remove listener
            // window.removeEventListener('hashchange', hashChange, false);
            window.onhashchange = null;
            
            // change hash
            if (hash === initialPageId) {
                location.href = location.href.split('#')[0];
            } else {
                location.hash = '#' + hash;
            }
            
            // add listener
            // window.addEventListener('hashchange', hashChange, false);
            window.onhashchange = hashChange;

        }
        function showPageByHref(href, options) {
            _debug();

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
                    success: function (data, textStatus) {
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
        function submitForm(e, callback) {
            _debug();

            $(':focus').blur();

            e.preventDefault();
            
            var $form = (typeof(e)==='string') ? $(e).eq(0) : (e.target ? $(e.target) : $(e));
            
            _debug($form.attr('action'));
            
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
            _debug();

            var $form = $el.closest('form');
            if ($form.length === 0) {
                _debug('No parent form found');
            } else {
                _debug('About to submit parent form');
                var evt = $.Event('submit');
                evt.preventDefault();
                $form.trigger(evt);
                return false;
            }
            return true;
        }
        function supportForAnimationEvents() {
            _debug();

            return (typeof WebKitAnimationEvent != 'undefined');
        }
        function supportForCssMatrix() {
            _debug();

            return (typeof WebKitCSSMatrix != 'undefined');
        }
        function supportForTouchEvents() {
            _debug();
            
            // If dev wants fast touch off, shut off touch whether device supports it or not
            if (!jQTSettings.useTouch) {
                return false
            }
            
            // Dev must want touch, so check for support
            if (typeof TouchEvent != 'undefined') {
                if (window.navigator.userAgent.indexOf('Mobile') > -1) { // Grrrr...
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };
        function supportForTransform3d() {
            _debug();
            
            var head, body, style, div, result;

            head = document.getElementsByTagName('head')[0];
            body = document.body;

            style = document.createElement('style');
            style.textContent = '@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){#jqtTestFor3dSupport{height:3px}}';

            div = document.createElement('div');
            div.id = 'jqtTestFor3dSupport';

            // Add to the page    
            head.appendChild(style);
            body.appendChild(div);

            // Check the result
            result = div.offsetHeight === 3;

            // Clean up
            style.parentNode.removeChild(style);
            div.parentNode.removeChild(div);

            // Pass back result
            // _debug('Support for 3d transforms: ' + result);
            return result;
        };
        function tapHandler(e){
            _debug();
            
            // Grab the target element
            var $el = $(e.target);

            // Find the nearest interactive ancestor
            if ($el.attr('nodeName')!=='A' && $el.attr('nodeName')!=='AREA') {
                $el = $el.closest('a, area');
            }
            
            var target = $el.attr('target'),
                hash = $el.attr('hash'),
                animation = null;

            if (tapReady == false) {
                _debug('Tap is not ready');
                return false;
            }

            if (!$el.length) {
                _debug('Nothing tappable here');
                return false;
            }

            if ($el.isExternalLink()) {
                $el.removeClass('active');
                return true;
            }

            if ($el.is(jQTSettings.backSelector)) {
                // User clicked or tapped a back button
                goBack(hash);

            } else if ($el.is(jQTSettings.submitSelector)) {
                // User clicked or tapped a submit element
                submitParentForm($el);

            } else if (target == '_webapp') {
                // User clicked or tapped an internal link, fullscreen mode
                window.location = $el.attr('href');
                return false;

            } else if ($el.attr('href') == '#') {
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
                };

                if (!animation) {
                    console.warn('Animation could not be found. Using slideleft.');
                    animation = 'slideleft';
                }

                if (hash && hash!='#') {
                    // Internal href
                    $el.addClass('active');
                    goTo($(hash).data('referrer', $el), animation, $(this).hasClass('reverse'));
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
        function touchStartHandler(e) {
            _debug();

            var $el = $(e.target);

            if ($el.attr('nodeName')!=='A' && $el.attr('nodeName')!=='AREA') {
                $el = $el.closest('a, area');
            }
            
            // Error check
            if (!$el.length) {
                _debug('Could not find a link element.');
                return;
            }

            var startTime = (new Date).getTime(),
                hoverTimeout = null,
                pressTimeout = null,
                touch, 
                startX, 
                startY, 
                deltaX = 0,
                deltaY = 0,
                deltaT = 0;
            
            if (event.changedTouches && event.changedTouches.length) {
                touch = event.changedTouches[0];
                startX = touch.pageX;
                startY = touch.pageY;
            }

            // Prep the link
            $el.bind('touchmove', touchmove).bind('touchend', touchend).bind('touchcancel', touchcancel);

            hoverTimeout = setTimeout(function() {
                $el.makeActive();
            }, jQTSettings.hoverDelay);

            pressTimeout = setTimeout(function() {
                _debug('press');
                $el.trigger('press');
                $el.unbind('touchmove',touchmove).unbind('touchend',touchend).unbind('touchcancel',touchcancel);
                $el.removeClass('active');
                clearTimeout(hoverTimeout);
            }, jQTSettings.pressDelay);

            // Private touch functions (TODO: insert dirty joke)
            function touchcancel(e) {
                _debug();
                clearTimeout(hoverTimeout);
                $el.removeClass('active');
                $el.unbind('touchmove',touchmove).unbind('touchend',touchend).unbind('touchcancel',touchcancel);
            }

            function touchmove(e) {
                _debug();
                updateChanges();
                var absX = Math.abs(deltaX);
                var absY = Math.abs(deltaY);
                var direction;
                if (absX > absY && (absX > 35) && deltaT < 1000) {
                    if (deltaX < 0) {
                        direction = 'left';
                    } else {
                        direction = 'right';
                    }
                    $el.trigger('swipe', {direction:direction, deltaX:deltaX, deltaY: deltaY});
                    $el.unbind('touchmove',touchmove).unbind('touchend',touchend).unbind('touchcancel',touchcancel);
                }
                $el.removeClass('active');
                clearTimeout(hoverTimeout);
                if (absX > jQTSettings.moveThreshold || absY > jQTSettings.moveThreshold) {
                    clearTimeout(pressTimeout);
                }
            } 

            function touchend() {
                _debug();
                updateChanges();
                if (Math.abs(deltaX) < jQTSettings.moveThreshold && Math.abs(deltaY) < jQTSettings.moveThreshold && deltaT < jQTSettings.pressDelay) {
                    _debug('deltaX:'+deltaX+';deltaY:'+deltaY+';');
                    $el.trigger('tap');
                } else {
                    $el.removeClass('active');
                }
                $el.unbind('touchmove',touchmove).unbind('touchend',touchend).unbind('touchcancel',touchcancel);
                clearTimeout(hoverTimeout);
                clearTimeout(pressTimeout);
            }

            function updateChanges() {
                _debug();
                var firstFinger = event.changedTouches[0] || null;
                deltaX = firstFinger.pageX - startX;
                deltaY = firstFinger.pageY - startY;
                deltaT = (new Date).getTime() - startTime;
                // _debug('deltaX:'+deltaX+';deltaY:'+deltaY+';');
            }

        } // End touch handler
        
        // Get the party started
        init(options);
        
        // Document ready stuff
        $(document).ready(function() {

            // Store some properties in the jQuery support object
            $.support.animationEvents = supportForAnimationEvents();
            $.support.cssMatrix = supportForCssMatrix();
            $.support.touch = supportForTouchEvents();
            $.support.transform3d = supportForTransform3d();
            
            if (!$.support.touch) {
                console.warn('This device does not support touch interaction, or it has been deactivated by the developer. Some features might be unavailable.');
            }
            if (!$.support.transform3d) {
                console.warn('This device does not support 3d animation. 2d animations will be used instead.');
            }
            
            // Define public jQuery functions
            $.fn.isExternalLink = function() {
                var $el = $(this);
                return ($el.attr('target') == '_blank' || $el.attr('rel') == 'external' || $el.is('input[type="checkbox"], input[type="radio"], a[href^="http://maps.google.com"], a[href^="mailto:"], a[href^="tel:"], a[href^="javascript:"], a[href*="youtube.com/v"], a[href*="youtube.com/watch"]'));
            }
            $.fn.makeActive = function() {
                return $(this).addClass('active');
            }
            $.fn.press = function(fn) {
                if ($.isFunction(fn)) {
                    return $(this).live('press', fn);
                } else {
                    return $(this).trigger('press');
                }
            }
            $.fn.swipe = function(fn) {
                if ($.isFunction(fn)) {
                    return $(this).live('swipe', fn);
                } else {
                    return $(this).trigger('swipe');
                }
            }
            $.fn.tap = function(fn) {
                if ($.isFunction(fn)) {
                    return $(this).live('tap', fn);
                } else {
                    return $(this).trigger('tap');
                }
            }
            $.fn.unselect = function(obj) {
                if (obj) {
                    obj.removeClass('active');
                } else {
                    $('.active').removeClass('active');
                }
            }

            // Add extensions
            for (var i=0, max=extensions.length; i < max; i++) {
                var fn = extensions[i];
                if ($.isFunction(fn)) {
                    $.extend(publicObj, fn(publicObj));
                }
            }
            
            // Set up animations array
            if (jQTSettings['cubeSelector']) {
                console.warn('NOTE: cubeSelector has been deprecated. Please use cubeleftSelector instead.');
                jQTSettings['cubeleftSelector'] = jQTSettings['cubeSelector'];
            }
            if (jQTSettings['flipSelector']) {
                console.warn('NOTE: flipSelector has been deprecated. Please use flipleftSelector instead.');
                jQTSettings['flipleftSelector'] = jQTSettings['flipSelector'];
            }
            if (jQTSettings['slideSelector']) {
                console.warn('NOTE: slideSelector has been deprecated. Please use slideleftSelector instead.');
                jQTSettings['slideleftSelector'] = jQTSettings['slideSelector'];
            }
            for (var i=0, max=defaults.animations.length; i < max; i++) {
                var animation = defaults.animations[i];
                if(jQTSettings[animation.name + 'Selector'] !== undefined){
                    animation.selector = jQTSettings[animation.name + 'Selector'];
                }
                addAnimation(animation);
            }
            
            // I'm not so sure about this stuff...
            touchSelectors.push('input');
            touchSelectors.push(jQTSettings.touchSelector);
            touchSelectors.push(jQTSettings.backSelector);
            touchSelectors.push(jQTSettings.submitSelector);
            $(touchSelectors.join(', ')).css('-webkit-touch-callout', 'none');

            // Make sure we have a jqt element
            $body = $('#jqt');
            if ($body.length === 0) {
                console.warn('Could not find an element with the id "jqt", so the body id has been set to "jqt". This might cause problems, so you should prolly wrap your panels in a div with the id "jqt".');
                $body = $('body').attr('id', 'jqt');
            }

            // Add some 3d specific css if need be
            if ($.support.transform3d) {
                $body.addClass('supports3d');
            }

            if (jQTSettings.fullScreenClass && window.navigator.standalone == true) {
                $body.addClass(jQTSettings.fullScreenClass + ' ' + jQTSettings.statusBar);
            }

            // Bind events
            if ($.support.touch) {
                $body.bind('touchstart', touchStartHandler);
                $body.bind('click', function(){return false});
            } else {
                $body.bind('click', clickHandler);
            }
            $body.bind('mousedown', mousedownHandler);
            $body.bind('orientationchange', orientationChangeHandler);
            $body.bind('submit', submitForm);
            $body.bind('tap', tapHandler);
            $body.trigger('orientationchange');

/*
            if (jQTSettings.useTouch && $.support.touch) {
                $body.click(function(e) {
                    // _debug('click called');
                    var timeDiff = (new Date()).getTime() - lastAnimationTime;
                    if (timeDiff > tapBuffer) {
                        var $el = $(e.target);

                        if ($el.attr('nodeName')!=='A' && $el.attr('nodeName')!=='AREA' && $el.attr('nodeName')!=='INPUT') {
                            $el = $el.closest('a, area');
                        }

                        if ($el.isExternalLink()) {
                            return true;
                        }
                    }
                    return false;
                });
            }
*/

            // Normalize href
            if (location.hash.length) {
                location.replace(location.href.split('#')[0]);
            }

            // Make sure exactly one child of body has "current" class
            if ($('#jqt > .current').length == 0) {
                currentPage = $('#jqt > *:first');
            } else {
                currentPage = $('#jqt > .current:first');
                $('#jqt > .current').removeClass('current');
            }

            // Go to the top of the "current" page
            $(currentPage).addClass('current');
            setHash($(currentPage).attr('id'));
            initialPageId = $(currentPage).attr('id');
            addPageToHistory(currentPage);
            scrollTo(0, 0);
        });

        // Expose public methods and properties
        publicObj = {
            animations: animations, 
            hist: hist, 
            settings: jQTSettings,
            support: $.support,
            getOrientation: getOrientation,
            goBack: goBack,
            goTo: goTo,
            addAnimation: addAnimation,
            submitForm: submitForm
        }
        return publicObj;
    }

    // Extensions directly manipulate the jQTouch object, before it's initialized.
    $.jQTouch.prototype.extensions = [];
    $.jQTouch.addExtension = function(extension) {
        $.jQTouch.prototype.extensions.push(extension);
    }

})(jQuery);