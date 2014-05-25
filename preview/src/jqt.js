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

   (c) 2009-2014 Sencha Labs

   Version: 0.99.5-rc10 - 2014-05-14

   jQTouch may be freely distributed under the MIT license.
*/
(function() {
  $.jQT = (function() {
    var $body, $currentPage, $head, animations, customHistory, newPageCount, tapBuffer, touchSelectors;

    jQT.prototype.extensions = [];

    jQT.prototype.animations = [
      {
        name: "cubeleft",
        selector: ".cubeleft, .cube",
        is3d: true
      }, {
        name: "cuberight",
        selector: ".cuberight",
        is3d: true
      }, {
        name: "dissolve",
        selector: ".dissolve"
      }, {
        name: "fade",
        selector: ".fade"
      }, {
        name: "flipleft",
        selector: ".flipleft, .flip",
        is3d: true
      }, {
        name: "flipright",
        selector: ".flipright",
        is3d: true
      }, {
        name: "pop",
        selector: ".pop",
        is3d: true
      }, {
        name: "swapleft",
        selector: ".swapleft, .swap",
        is3d: true
      }, {
        name: "swapright",
        selector: ".swapright",
        is3d: true
      }, {
        name: "slidedown",
        selector: ".slidedown"
      }, {
        name: "slideright",
        selector: ".slideright"
      }, {
        name: "slideup",
        selector: ".slideup"
      }, {
        name: "slideleft",
        selector: ".slideleft, .slide, #jqt > * > ul li a"
      }
    ];

    jQT.prototype.orientation = 'portrait';

    jQT.prototype.tapHandlers = [];

    jQT.prototype.defaults = {
      addGlossToIcon: true,
      backSelector: ".back, .cancel, .goback",
      cacheGetRequests: true,
      defaultAnimation: "slideleft",
      fixedViewport: true,
      formSelector: "form",
      fullScreen: true,
      fullScreenClass: "fullscreen",
      icon: null,
      icon4: null,
      preloadImages: false,
      starter: $(document).ready,
      startupScreen: null,
      statusBar: "default",
      submitSelector: ".submit",
      touchSelector: "a, .touch",
      updateHash: true,
      useAnimations: true,
      useFastTouch: true,
      useTouchScroll: true
    };

    jQT.addExtension = function(extension) {
      return this.prototype.extensions.push(extension);
    };

    jQT.addTapHandler = function(tapHandler) {
      if (typeof tapHandler.name === "string" && typeof tapHandler.isSupported === "function" && typeof tapHandler.fn === "function") {
        return this.prototype.tapHandlers.push(tapHandler);
      }
    };

    jQT.addAnimation = function(animation) {
      if (typeof animation.selector === "string" && typeof animation.name === "string") {
        return this.animations.push(animation);
      }
    };

    $body = void 0;

    $head = $("head");

    animations = jQT.prototype.animations;

    customHistory = [];

    newPageCount = 0;

    $currentPage = "";

    touchSelectors = [];

    tapBuffer = 100;

    function jQT(options) {
      var addPageToHistory, clickHandler, doNavigation, getAnimation, hashChangeHandler, initHairExtensions, insertPages, isExternalLink, orientationChangeHandler, reverseAnimation, setHash, showPageByHref, start, submitHandler, submitParentForm, support, tapHandler, touchStartHandler;
      this.tapHandlers = this.tapHandlers.concat([
        {
          name: "external-link",
          isSupported: function(e, params) {
            return isExternalLink(params.$el);
          },
          fn: function(e, params) {
            params.$el.removeClass('active');
            return true;
          }
        }, {
          name: "back-selector",
          isSupported: (function(_this) {
            return function(e, params) {
              return params.$el.is(_this.settings.backSelector);
            };
          })(this),
          fn: (function(_this) {
            return function(e, params) {
              _this.goBack(params.hash);
              return false;
            };
          })(this)
        }, {
          name: "submit-selector",
          isSupported: (function(_this) {
            return function(e, params) {
              return params.$el.is(_this.settings.submitSelector);
            };
          })(this),
          fn: function(e, params) {
            submitParentForm(params.$el);
          }
        }, {
          name: "webapp",
          isSupported: function(e, params) {
            return params.target === "_webapp";
          },
          fn: function(e, params) {
            window.location = params.href;
            return false;
          }
        }, {
          name: "no-op",
          isSupported: function(e, params) {
            return params.href === "#";
          },
          fn: function(e, params) {
            params.$el.removeClass('active');
            return true;
          }
        }, {
          name: "standard",
          isSupported: function(e, params) {
            return params.hash && params.hash !== "#";
          },
          fn: (function(_this) {
            return function(e, params) {
              var animation;
              animation = getAnimation(params.$el);
              params.$el.addClass("active");
              _this.goTo($(params.hash).data("referrer", params.$el), animation, params.$el.hasClass("reverse"));
              return false;
            };
          })(this)
        }, {
          name: "external",
          isSupported: function(e, params) {
            return true;
          },
          fn: function(e, params) {
            var animation;
            animation = getAnimation(params.$el);
            params.$el.addClass("loading active");
            showPageByHref(params.$el.attr("href"), {
              animation: animation,
              callback: function() {
                params.$el.removeClass("loading");
                return setTimeout(function() {
                  return params.$el.removeClass('active');
                }, 250);
              },
              $referrer: params.$el
            });
            return false;
          }
        }
      ]);
      this.goTo = (function(_this) {
        return function(toPage, animation) {
          var anim, fromPage, nextPage, _i, _len;
          fromPage = customHistory[0].page;
          if (typeof animation === "string") {
            for (_i = 0, _len = animations.length; _i < _len; _i++) {
              anim = animations[_i];
              if (anim.name === animation) {
                animation = anim;
                break;
              }
            }
          }
          if (typeof toPage === "string") {
            nextPage = $(toPage);
            if (!nextPage.length) {
              showPageByHref(toPage, {
                animation: animation
              });
              return;
            } else {
              toPage = nextPage;
            }
          }
          if (doNavigation(fromPage, toPage, animation)) {
            _this;
          } else {
            console.warn("Could not animate pages.");
            return false;
          }
        };
      })(this);
      this.goBack = (function(_this) {
        return function(toPage) {
          var end, from, h, i, to, _i, _len;
          if (customHistory.length < 1) {
            console.warn("History is empty.");
          }
          if (customHistory.length === 1) {
            console.warn("You are on the first panel.");
            window.history.go(-1);
          }
          if (typeof toPage === 'number') {
            if (toPage > 0) {
              customHistory.splice(1, toPage);
            } else if (toPage < 0) {
              customHistory.splice(1, customHistory.length + toPage - 1);
            }
          } else if (/^#.+/.test(toPage)) {
            end = 0;
            for (i = _i = 0, _len = customHistory.length; _i < _len; i = ++_i) {
              h = customHistory[i];
              if (h.hash === toPage) {
                end = i;
                break;
              }
            }
            customHistory.splice(1, end - 1);
          }
          from = customHistory[0];
          to = customHistory[1];
          if (!((from != null) && (to != null))) {
            return;
          }
          if (doNavigation(from.page, to.page, from.animation, true)) {
            _this;
          } else {
            console.warn("Could not go back.");
            return false;
          }
        };
      })(this);
      initHairExtensions = (function(_this) {
        return function(options) {
          var hairExtensions, i, precomposed, _i, _len, _ref;
          _ref = _this.settings.preloadImages;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            (new Image()).src = _this.settings.preloadImages[i];
          }
          hairExtensions = [];
          precomposed = _this.settings.addGlossToIcon ? '' : '-precomposed';
          if (_this.settings.icon) {
            hairExtensions.push("<link rel=\"apple-touch-icon" + precomposed + "\" href=\"" + _this.settings.icon + "\">");
          }
          if (_this.settings.icon4) {
            hairExtensions.push("<link rel=\"apple-touch-icon" + precomposed + "\" sizes=\"114x114\" href=\"" + _this.settings.icon4 + "\">");
          }
          if (_this.settings.startupScreen) {
            hairExtensions.push("<link rel=\"apple-touch-startup-image\" href=\"" + _this.settings.startupScreen + "\">");
          }
          if (_this.settings.fixedViewport) {
            hairExtensions.push("<meta name=\"viewport\" content=\"initial-scale=1.0, maximum-scale=1.0, user-scalable=0\">");
          }
          if (_this.settings.fullScreen) {
            hairExtensions.push("<meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />");
            if (_this.settings.statusBar) {
              hairExtensions.push("<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"" + _this.settings.statusBar + "\">");
            }
          }
          if (hairExtensions.length) {
            return $head.prepend(hairExtensions.join(''));
          }
        };
      })(this);
      insertPages = (function(_this) {
        return function(nodes, animation) {
          var targetPage;
          targetPage = null;
          $(nodes).each(function(index, node) {
            var $node;
            $node = $(this);
            if (!$node.attr("id")) {
              $node.attr("id", "page-" + (++newPageCount));
            }
            $("#" + $node.attr("id")).remove();
            $body.append($node);
            $body.trigger("pageInserted", {
              page: $node
            });
            if ($node.hasClass("current") || !targetPage) {
              return targetPage = $node;
            }
          });
          if (targetPage != null) {
            _this.goTo(targetPage, animation);
            targetPage;
          } else {
            return false;
          }
        };
      })(this);
      addPageToHistory = function(page, animation) {
        var id;
        id = page.attr('id');
        return customHistory.unshift({
          page: page,
          animation: animation,
          hash: "#" + id,
          id: id
        });
      };
      clickHandler = (function(_this) {
        return function(e) {
          var $el;
          $el = $(e.target);
          if (!$el.is(touchSelectors.join(", "))) {
            $el = $el.closest(touchSelectors.join(", "));
          }
          if ($el && $el.attr("href") && !isExternalLink($el)) {
            console.warn("Need to prevent default click behavior.");
            e.preventDefault();
          } else {
            console.warn("No need to prevent default click behavior.");
          }
          if (!support.touch) {
            console.warn("Converting click event to a tap event because touch handlers are not present or off.");
            $(e.target).trigger("tap", e);
          }
        };
      })(this);
      hashChangeHandler = (function(_this) {
        return function(e) {
          if (location.hash === customHistory[0].hash) {
            console.log("We are on the right panel.");
            return true;
          } else if (location.hash === "") {
            _this.goBack();
            return true;
          } else if (customHistory[1] && location.hash === customHistory[1].hash) {
            _this.goBack();
            return true;
          } else {
            console.warn("Could not find ID in history, just forwarding to DOM element.");
            _this.goTo($(location.hash), _this.settings.defaultAnimation);
          }
        };
      })(this);
      isExternalLink = function($el) {
        return $el.attr("target") === "_blank" || $el.attr("rel") === "external" || $el.is("a[href^=\"http://maps.google.com\"], a[href^=\"mailto:\"], a[href^=\"tel:\"], a[href^=\"javascript:\"], a[href*=\"youtube.com/v\"], a[href*=\"youtube.com/watch\"]");
      };
      getAnimation = (function(_this) {
        return function($el) {
          var animation, resultAnimation, _i, _len;
          for (_i = 0, _len = animations.length; _i < _len; _i++) {
            animation = animations[_i];
            if ($el.is(animation.selector)) {
              resultAnimation = animation;
              break;
            }
          }
          if (!resultAnimation) {
            console.warn("Animation could not be found. Using " + _this.settings.defaultAnimation + ".");
            resultAnimation = _this.settings.defaultAnimation;
          }
          return resultAnimation;
        };
      })(this);
      showPageByHref = (function(_this) {
        return function(href, options) {
          options = $.extend({}, {
            data: null,
            method: "GET",
            animation: null,
            $referrer: null
          }, options);
          if (href.charAt(0) !== '#') {
            return $.ajax({
              url: href,
              data: options.data,
              type: options.method,
              success: function(data) {
                var firstPage;
                firstPage = insertPages(data, options.animation);
                if (firstPage) {
                  if (options.method === "GET" && _this.settings.cacheGetRequests === true && options.$referrer) {
                    return options.$referrer.attr("href", "#" + firstPage.attr("id"));
                  }
                }
              },
              error: function(data) {
                if (options.$referrer) {
                  return options.$referrer.removeClass('active');
                }
              }
            });
          } else {
            if (options.$referrer) {
              return options.$referrer.removeClass('active');
            }
          }
        };
      })(this);
      support = void 0;
      start = (function(_this) {
        return function() {
          var $touchSelectors, anatomyLessons, extFn, startHash, _i, _len, _ref;
          support = $.support || {};
          $.extend(support, {
            animationEvents: typeof window.WebKitAnimationEvent !== "undefined",
            touch: (typeof window.TouchEvent !== "undefined") && (window.navigator.userAgent.indexOf("Mobile") > -1) && _this.settings.useFastTouch,
            transform3d: function() {
              var body, div, head, result, style;
              head = $head.get(0);
              body = document.body;
              style = document.createElement("style");
              style.textContent = "@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-webkit-transform-3d){#jqt-3dtest{height:3px}}";
              div = document.createElement("div");
              div.id = "jqt-3dtest";
              head.appendChild(style);
              body.appendChild(div);
              result = div.offsetHeight === 3;
              style.parentNode.removeChild(style);
              div.parentNode.removeChild(div);
              console.warn("Support for 3d transforms: " + result + ".");
              return result;
            }
          });
          if (!support.touch) {
            console.warn("This device does not support touch interaction, or it has been deactivated by the developer. Some features might be unavailable.");
          }
          if (!support.transform3d) {
            console.warn("This device does not support 3d animation. 2d animations will be used instead.");
          }
          _ref = _this.extensions;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            extFn = _ref[_i];
            if ($.isFunction(extFn)) {
              $.extend(_this, extFn(_this));
            }
          }
          touchSelectors.push(_this.settings.touchSelector.concat(_this.settings.backSelector, _this.settings.submitSelector));
          $touchSelectors = $(touchSelectors.join(', ')).css('-webkit-touch-callout', 'none');
          $body = $("#jqt");
          anatomyLessons = [];
          if (!$body.length) {
            console.warn("Could not find an element with the id “jqt”, so the body id has been set to \"jqt\". If you are having any problems, wrapping your panels in a div with the id “jqt” might help.");
            $body = $(document.body).attr("id", "jqt");
          }
          if (support.transform3d) {
            anatomyLessons.push("supports3d");
          }
          anatomyLessons.push(_this.settings.useTouchScroll ? 'touchscroll' : 'autoscroll');
          if (_this.settings.fullScreenClass && window.navigator.standalone) {
            anatomyLessons.push(_this.settings.fullScreenClass, _this.settings.statusBar);
          }
          $body.addClass(anatomyLessons.join(" ")).bind("click", clickHandler).bind("orientationchange", orientationChangeHandler).bind("submit", submitHandler).bind("tap", tapHandler).bind((support.touch ? "touchstart" : "mousedown"), touchStartHandler).trigger("orientationchange");
          if (_this.settings.updateHash) {
            $(window).bind("hashchange", hashChangeHandler);
          }
          startHash = location.hash;
          if (!$("#jqt > .current").length) {
            $currentPage = $("#jqt > *:first-child").addClass("current");
          } else {
            $currentPage = $("#jqt > .current");
          }
          setHash($currentPage.attr("id"));
          addPageToHistory($currentPage);
          if (_this.settings.updateHash && $(startHash).length) {
            return _this.goTo(startHash);
          }
        };
      })(this);
      orientationChangeHandler = function() {
        var orientation;
        scrollTo(0, 0);
        orientation = (Math.abs(window.orientation) === 90 ? "landscape" : "portrait");
        return $body.removeClass("portrait landscape").addClass(orientation).trigger("turn", {
          orientation: orientation
        });
      };
      reverseAnimation = function(animation) {
        var opposites;
        opposites = {
          up: "down",
          down: "up",
          left: "right",
          right: "left",
          "in": "out",
          out: "in"
        };
        return opposites[animation] || animation;
      };
      setHash = (function(_this) {
        return function(hash) {
          if (_this.settings.updateHash) {
            return location.hash = "#" + hash.replace(/^#/, "");
          }
        };
      })(this);
      submitHandler = (function(_this) {
        return function(e, callback) {
          var $form;
          $(":focus").trigger("blur");
          $form = (typeof e === "string" ? $(e).eq(0) : (e.target ? $(e.target) : $(e)));
          if ($form.length && $form.is(_this.settings.formSelector) && $form.attr("action")) {
            e.preventDefault();
            return showPageByHref($form.attr("action"), {
              data: $form.serialize(),
              method: $form.attr("method") || "POST",
              animation: getAnimation($form),
              callback: callback
            });
          }
        };
      })(this);
      submitParentForm = function($el) {
        var $form;
        $form = $el.closest("form");
        if ($form.length) {
          console.warn("About to submit parent form.");
          $form.trigger("submit");
          return false;
        } else {
          console.warn("No parent form found.");
          return true;
        }
      };
      tapHandler = (function(_this) {
        return function(e) {
          var $el, flag, handler, hash, href, params, selectors, target, _i, _len, _ref;
          if (e.isDefaultPrevented()) {
            return true;
          }
          $el = $(e.target);
          selectors = touchSelectors.join(',');
          if (!$el.is(selectors)) {
            $el = $el.closest(selectors);
          }
          if (!$el.length || !$el.attr("href")) {
            console.warn("Could not find a link related to tapped element.");
            return true;
          }
          target = $el.attr("target");
          hash = $el.prop("hash");
          href = $el.attr("href");
          params = {
            e: e,
            $el: $el,
            target: target,
            hash: hash,
            href: href
          };
          _ref = _this.tapHandlers;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            handler = _ref[_i];
            if (handler.isSupported(e, params)) {
              return flag = handler.fn(e, params);
            }
          }
        };
      })(this);
      touchStartHandler = function(e) {
        var $el, selectors;
        $el = $(e.target);
        selectors = touchSelectors.join(", ");
        if (!$el.is(selectors)) {
          $el = $el.closest(selectors);
        }
        if ($el.length && $el.attr("href")) {
          $el.addClass("active");
        }
        $el.on((support.touch ? "touchmove" : "mousemove"), function() {
          return $el.removeClass("active");
        });
        return $el.on("touchend", function() {
          return $el.unbind("touchmove mousemove");
        });
      };
      doNavigation = (function(_this) {
        return function(fromPage, toPage, animation, goingBack) {
          var finalAnimationName, is3d, navigationEndHandler;
          if (goingBack == null) {
            goingBack = false;
          }
          navigationEndHandler = function(event) {
            if (support.animationEvents && animation && _this.settings.useAnimations) {
              fromPage.unbind("webkitAnimationEnd", navigationEndHandler);
              fromPage.removeClass(finalAnimationName + " out");
              if (finalAnimationName) {
                toPage.removeClass(finalAnimationName);
              }
              $body.removeClass("animating animating3d");
            } else {
              fromPage.removeClass(finalAnimationName + " out");
              if (finalAnimationName) {
                toPage.removeClass(finalAnimationName);
              }
            }
            setTimeout(function() {
              toPage.removeClass('in');
              return window.scroll(0, 0);
            }, tapBuffer);
            fromPage.find('.active').removeClass('active');
            toPage.trigger("pageAnimationEnd", {
              direction: "in",
              animation: animation,
              back: goingBack
            });
            return fromPage.trigger("pageAnimationEnd", {
              direction: "out",
              animation: animation,
              back: goingBack
            });
          };
          if (!toPage.length) {
            $('.active').removeClass('active');
            console.warn("Target element is missing.");
            return false;
          }
          if (toPage.hasClass("current")) {
            $('.active').removeClass('active');
            console.warn("You are already on the page you are trying to navigate to.");
            return false;
          }
          $(":focus").trigger("blur");
          fromPage.trigger("pageAnimationStart", {
            direction: "out",
            back: goingBack
          });
          toPage.trigger("pageAnimationStart", {
            direction: "in",
            back: goingBack
          });
          if (support.animationEvents && animation && _this.settings.useAnimations) {
            finalAnimationName = animation.name;
            is3d = animation.is3d ? " animating3d" : "";
            if (!support.transform3d && animation.is3d) {
              console.warn("Did not detect support for 3d animations, falling back to " + _this.settings.defaultAnimation + ".");
              finalAnimationName = _this.settings.defaultAnimation;
              is3d = '';
            }
            if (goingBack) {
              finalAnimationName = finalAnimationName.replace(/left|right|up|down|in|out/, reverseAnimation);
            }
            if (finalAnimationName == null) {
              finalAnimationName = _this.settings.defaultAnimation;
            }
            console.warn("finalAnimationName:", finalAnimationName);
            fromPage.bind("webkitAnimationEnd", navigationEndHandler);
            $body.addClass("animating" + is3d);
            toPage.addClass(finalAnimationName + " in current");
            fromPage.removeClass("current").addClass(finalAnimationName + " out");
          } else {
            toPage.addClass("current in");
            fromPage.removeClass("current");
            navigationEndHandler();
          }
          $currentPage = toPage;
          if (goingBack) {
            customHistory.shift();
          } else {
            addPageToHistory($currentPage, animation);
          }
          setHash($currentPage.attr("id"));
          return true;
        };
      })(this);
      this.settings = $.extend({}, this.defaults, options);
      initHairExtensions();
      this.settings.starter(start);
    }

    return jQT;

  })();

  $.jQTouch = $.jQT;

}).call(this);
