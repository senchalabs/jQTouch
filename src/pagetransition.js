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

    (c) 2009-2013 Sencha Labs
    jQTouch may be freely distributed under the MIT license.

*/

(function() {
    // cross-browser code borrowed from Zepto/fx.js
    var prefix = '', off = false,
        vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
        document = window.document, testEl = document.createElement('div');

    $.each(vendors, function(vendor, event){
        if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
            prefix = '-' + downcase(vendor) + '-';
            eventPrefix = event;
            return false;
        }
    });
    off = (eventPrefix === undefined && testEl.style.transitionProperty === undefined);

    function normalizeEvent(name) {
        return eventPrefix? eventPrefix + name: downcase(name);
    }
    // -- end of borrowing

    function warn(message) {
        if (window.console !== undefined && $.jQTouch.defaults.debug) {
            console.warn(message);
        }
    }

    $.jQTouch.addExtension(function(jQTouch) {
        var animations=[];

        function addAnimation(animation) {
            if (typeof(animation.selector) === 'string' && typeof(animation.name) === 'string') {
                animations.push(animation);
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
                warn('Animation could not be found. Using ' + jQTSettings.defaultAnimation + '.');
                animation = jQTSettings.defaultAnimation;
            }
            return animation;
        }

        function reverseAnimation(animation) {
            var opposites = {
                'up' : 'down',
                'down' : 'up',
                'left' : 'right',
                'right' : 'left',
                'in' : 'out',
                'out' : 'in'
            };

            return opposites[animation] || animation;
        }

        return $.extend(jQTouch, {
          addAnimation: addAnimation
        });
    });

    function animate(fromPage, toPage, animation, goingBack, callback) {
        goingBack = !!goingBack;

        // Collapse the keyboard
        $(':focus').trigger('blur');

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
            fromPage.bind(normalizeEvent('AnimationEnd'), navigationEndHandler);

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

        // Private navigationEnd callback
        function navigationEndHandler(event) {
            var effected = false;

            if ($.support.animationEvents && animation && jQTSettings.useAnimations) {
                effected = true;
                fromPage.unbind(normalizeEvent('AnimationEnd'), navigationEndHandler);
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
            }

            callback(effected);
        }

        return true;
    }

    $.jQTouch.defaults = $.extend({
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
        ],
        animator: {
            animate: animate
        }
    });
}());