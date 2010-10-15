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

    (c) 2009 by jQTouch project members.
    See LICENSE.txt for license.

    $Revision: 148 $
    $Date: 2010-04-24 17:00:00 -0400 (Sat, 24 Apr 2010) $
    $LastChangedBy: davidcolbykaneda $

*/

(function($) {
    $.jQTouch = function(options) {

        // Initialize internal jQT variables
        var $body,
            $head=$('head'),
            hist=[],
            newPageCount=0,
            jQTSettings={},
            currentPage,
            orientation,
            tapReady=true,
            lastAnimationTime=0,
            touchSelectors=[],
            publicObj={},
            tapBuffer=351,
            extensions=$.jQTouch.prototype.extensions,
            defaults = {
                addGlossToIcon: true,
                backSelector: '.back, .cancel, .goback',
                cacheGetRequests: true,
                default2dAnimation: 'slideup', 
                fixedViewport: true,
                formSelector: 'form',
                fullScreen: true,
                fullScreenClass: 'fullscreen',
                icon: null,
                icon4: null, // experimental
                moveThreshold: 10,
                preloadImages: false,
                pressDelay: 1000,
                startupScreen: null,
                statusBar: 'default', // other options: black-translucent, black
                submitSelector: '.submit',
                touchSelector: 'a, .touch',
                unloadMessage: 'Doing so will log you out of the app.', 
                useAnimations: true,
                useFastTouch: true, // experimental
                animations: [
                    {name:'cube', selector:'.cube', is3d:true, default2d:'slideup'},
                    {name:'dissolve', selector:'.dissolve', is3d:false},
                    {name:'fade', selector:'.fade', is3d:false},
                    {name:'flip', selector:'.flip', is3d:true, default2d:'fade'},
                    {name:'pop', selector:'.pop', is3d:false},
                    {name:'slide', selector:'#jqt > * > ul li a, .slide', is3d:false},
                    {name:'slideup', selector:'.slideup', is3d:false},
                    {name:'swap', selector:'.swap', is3d:true, default2d:'slideup'}
                ]
            },
            animations=[],
            hairExtensions='';
        
        function _alert(message) {
            // alert(message);
            console.log(message);
        }
        function _debug() {
            _alert('called: ' + arguments.callee.caller.name);
        }
        function addAnimation(animation) {
            _debug();
            if (typeof(animation.selector) === 'string' && typeof(animation.name) === 'string') {
                animations.push(animation);
                $(animation.selector).tap(tapHandler);
            }
        }
        function addPageToHistory(page, animation, reverse) {
            _debug();
            // Grab some info
            var pageId = page.attr('id');
            // Prepend info to page history
            hist.unshift({
                page: page,
                animation: animation,
                reverse: reverse || false,
                id: pageId
            });
        }
        function animatePages(fromPage, toPage, animation, backwards) {
            _debug();
            
            // _alert('animation: ' + animation.name + '; backwards: ' + backwards);
            
            // Error check for target page
            if (toPage.length === 0) {
                $.fn.unselect();
                _alert('Target element is missing.');
                return false;
            }

            // Error check for fromPage=toPage
            if (toPage.hasClass('current')) {
                $.fn.unselect();
                _alert('Target element is the current page.');
                return false;
            }

            // Collapse the keyboard
            $(':focus').blur();

            // Make sure we are scrolled up to hide location bar
            // toPage.css('top', window.pageYOffset);

            // Define callback to run after animation completes
            var callback = function(event) {

                if($.support.animationEvents) {
                    fromPage.unbind('webkitTransitionEnd', callback);
                    fromPage.unbind('webkitAnimationEnd', callback);
                }

                if (animation) {
                    toPage.removeClass('start in ' + animation.name);
                    fromPage.removeClass('start out current ' + animation.name);
                    if (backwards) {
                        toPage.toggleClass('reverse');
                        fromPage.toggleClass('reverse');
                    }
                    // toPage.css('top', 0);
                } else {
                    fromPage.removeClass('current');
                }

                toPage.trigger('pageAnimationEnd', {direction:'in', reverse:backwards });
                fromPage.trigger('pageAnimationEnd', {direction:'out', reverse:backwards });

                currentPage = toPage;
                setHash(currentPage.attr('id'));

                var $originallink = toPage.data('referrer');
                if ($originallink) {
                    $originallink.unselect();
                }
                lastAnimationTime = (new Date()).getTime();
                tapReady = true;

            }

            fromPage.trigger('pageAnimationStart', { direction: 'out' });
            toPage.trigger('pageAnimationStart', { direction: 'in' });

            if ($.support.animationEvents && animation && jQTSettings.useAnimations) {

                tapReady = false;

                if (backwards) {
                    toPage.toggleClass('reverse');
                    fromPage.toggleClass('reverse');
                }

                // Support both transitions and animations
                fromPage.bind('webkitTransitionEnd', callback);
                fromPage.bind('webkitAnimationEnd', callback);

                // Fail over to 2d if need be
                if (!$.support.transform3d && animation.is3d) {
                    if (animation.default2d) {
                        animation.name = animation.default2d;
                    } else {
                        animation.name = jQTSettings.default2dAnimation;
                    }
                }
                
                toPage.addClass(animation.name + ' in current');
                fromPage.addClass(animation.name + ' out');

                
                setTimeout(function(){
                    toPage.addClass('start');
                    fromPage.addClass('start');
                }, 0);

            } else {
                toPage.addClass('current');
                callback();
            }

            return true;
        }
        function clickHandler(e) {
            _debug();

            // Prevent the default click behavior
            e.preventDefault();
            
            // Convert the click to a tap
            $(e.target).trigger('tap');
            
        }
        function getOrientation() {
            _debug();
            return orientation;
        }
        function goBack(to) {
            _debug();
            
            // Error checking
            if (hist.length < 1 ) {
                _alert('History is empty.');
            }
            
            if (hist.length === 1 ) {
                _alert('You are on the first panel.');
            }
            
            var numberOfPages = Math.min(parseInt(to || 1, 10), hist.length-1),
                curPage = hist[0];

            // Search through the history for an ID
            if(isNaN(numberOfPages) && typeof(to) === "string" && to != '#' ) {
                for( var i=1, length=hist.length; i < length; i++ ) {
                    if( '#' + hist[i].id === to ) {
                        numberOfPages = i;
                        break;
                    }
                }
            }

            // If still nothing, assume one
            if(isNaN(numberOfPages) || numberOfPages < 1) {
                numberOfPages = 1;
            };

            if (hist.length > 1) {
                // Remove all pages in front of the target page
                hist.splice(0, numberOfPages);
                animatePages(curPage.page, hist[0].page, curPage.animation, curPage.reverse === false);
            } else {
                setHash(curPage.id);
            }
            
            // Prevent default behavior
            return false;
        }
        function goTo(toPage, animation, reverse) {
            _debug();

            var fromPage = hist[0].page;

            if (typeof(animation) === 'string') {
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
            if (animatePages(fromPage, toPage, animation, reverse)) {
                addPageToHistory(toPage, animation, reverse);
                return publicObj;
            } else {
                _alert('Could not animate pages.');
                return false;
            }
        }
        function hashChange(e) {
            _debug();
            if (location.hash != '#' + currentPage.attr('id')) {
                goBack(location.hash);
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
            
            return; // This function is disabled until I can get real browser history/back button support working
            
            // trim leading # if need be
            if (hash[0]=='#') {
                hash = hash.slice(1);
            }
            
            // remove listener
            // window.removeEventListener('hashchange', hashChange, false);
            window.onhashchange = null;
            
            // change hash
            if (location.hash=='') {
                location.replace(location.href + '#' + hash);
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
            
            var $form = (typeof(e)==='string') ? $(e).eq(0) : (e.target ? $(e.target) : $(e));

            if ($form.length && $form.is(jQTSettings.formSelector)) {
                showPageByHref($form.attr('action'), {
                    data: $form.serialize(),
                    method: $form.attr('method') || "POST",
                    animation: animations[0] || null,
                    callback: callback
                });
                return false;
            }
            return true;
        }
        function submitParentForm(e) {
            _debug();

            var $form = $(this).closest('form');
            if ($form.length) {
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
            if (!jQTSettings.useFastTouch) {
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
            // _alert('Support for 3d transforms: ' + result);
            return result;
        };
        function tapHandler(e){
            _debug();
            
            // Grab the target element
            var $el = $(e.target);

            if ($el.attr('nodeName')!=='A' && $el.attr('nodeName')!=='AREA') {
                $el = $el.closest('a, area');
            }

            var target = $el.attr('target'),
                hash = $el.attr('hash'),
                animation = null;

            if (tapReady == false) {
                _alert('Tap is not ready.');
                return false;
            }

            if (!$el.length) {
                _alert('Nothing tappable there.');
                return false;
            }

            if ($el.isExternalLink()) {
                $el.removeClass('active');
                return true;
            }

            // Figure out the animation to use
            for (var i=0, max=animations.length; i < max; i++) {
                if ($el.is(animations[i].selector)) {
                    animation = animations[i];
                    break;
                }
            };
            
            if ($el.is(jQTSettings.backSelector)) {
                // User clicked or tapped a back button
                goBack(hash);

            } else if ($el.is(jQTSettings.submitSelector)) {
                // User clicked or tapped a submit element
                submitParentForm();

            } else if (target == '_webapp') {
                // User clicked or tapped an internal link, fullscreen mode
                window.location = $el.attr('href');
                return false;

            } else if ($el.attr('href') == '#') {
                // Allow tap on item with no href
                $el.unselect();
                return true;

            } else if (hash && hash!='#') {
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
        function touchStartHandler(e) {
            _debug();
            
            var $el = $(e.target);
            var $link = $(e.target).closest('a, area');
            
            // Bomb out if we didn't find a link
            if (!$link.length) {
                // _alert('Could not find a link element.');
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
            $el = $link;
            $el.bind('touchmove', touchmove).bind('touchend', touchend).bind('touchcancel', touchcancel);

            hoverTimeout = setTimeout(function() {
                $el.makeActive();
            }, 100);

            pressTimeout = setTimeout(function() {
                _alert('press');
                $el.trigger('press');
                $el.unbind('touchmove',touchmove).unbind('touchend',touchend).unbind('touchcancel',touchcancel);
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
                    // _alert('Swipe ' + direction);
                    $el.trigger('swipe', {direction:direction, deltaX:deltaX, deltaY: deltaY});
                    $el.unbind('touchmove',touchmove).unbind('touchend',touchend).unbind('touchcancel',touchcancel);
                } else if (absY > 1) {
                    $el.removeClass('active');
                }
                clearTimeout(hoverTimeout);
                if (absX > jQTSettings.moveThreshold || absY > jQTSettings.moveThreshold) {
                    clearTimeout(pressTimeout);
                }
            } 

            function touchend() {
                _debug();
                updateChanges();
                // _alert('deltaX:'+deltaX+';deltaY:'+deltaY+';');
                if (Math.abs(deltaX) < jQTSettings.moveThreshold && Math.abs(deltaY) < jQTSettings.moveThreshold && deltaT < jQTSettings.pressDelay) {
                    _alert('tapped')
                    $el.trigger('tap');
                } else {
                    $el.removeClass('active');
                }
                $el.unbind('touchmove',touchmove).unbind('touchend',touchend).unbind('touchcancel',touchcancel);
                clearTimeout(hoverTimeout);
                clearTimeout(pressTimeout);
            }

            function updateChanges() {
                var firstFinger = event.changedTouches[0] || null;
                deltaX = firstFinger.pageX - startX;
                deltaY = firstFinger.pageY - startY;
                deltaT = (new Date).getTime() - startTime;
                // _alert('deltaX:'+deltaX+';deltaY:'+deltaY+';');
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
                _alert('This device does not support touch interaction, or they have been shut off by the developer. Some features might be unavailable.');
            }
            if (!$.support.transform3d) {
                _alert('This device does not support 3d animation. 2d animations will be used instead.');
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

            // Bind touch handlers to DOM objects that trigger standard animations
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

            $body = $('#jqt');

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
            $body.bind('tap', tapHandler);
            $body.trigger('orientationchange');
            $body.submit(submitForm);
            
            // Interim back button solution
            window.onbeforeunload = function(e) {
                var e = e || window.event;
                var message = jQTSettings.unloadMessage;
                if (e) {
                    e.returnValue = message;
                }
                return message;
            }
            

/*
            if (jQTSettings.useFastTouch && $.support.touch) {
                $body.click(function(e) {
                    // _alert('click called');
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