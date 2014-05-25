class $.jQT
  extensions: []
  animations: [
    name: "cubeleft"
    selector: ".cubeleft, .cube"
    is3d: true
  ,
    name: "cuberight"
    selector: ".cuberight"
    is3d: true
  ,
    name: "dissolve"
    selector: ".dissolve"
  ,
    name: "fade"
    selector: ".fade"
  ,
    name: "flipleft"
    selector: ".flipleft, .flip"
    is3d: true
  ,
    name: "flipright"
    selector: ".flipright"
    is3d: true
  ,
    name: "pop"
    selector: ".pop"
    is3d: true
  ,
    name: "swapleft"
    selector: ".swapleft, .swap"
    is3d: true
  ,
    name: "swapright"
    selector: ".swapright"
    is3d: true
  ,
    name: "slidedown"
    selector: ".slidedown"
  ,
    name: "slideright"
    selector: ".slideright"
  ,
    name: "slideup"
    selector: ".slideup"
  ,
    name: "slideleft"
    selector: ".slideleft, .slide, #jqt > * > ul li a"
  ]
  orientation: 'portrait'
  tapHandlers: []
  defaults:
    addGlossToIcon: true
    backSelector: ".back, .cancel, .goback"
    cacheGetRequests: true
    defaultAnimation: "slideleft"
    fixedViewport: true
    formSelector: "form"
    fullScreen: true
    fullScreenClass: "fullscreen"
    icon: null
    icon4: null
    preloadImages: false
    starter: $(document).ready
    startupScreen: null
    statusBar: "default"
    submitSelector: ".submit"
    touchSelector: "a, .touch"
    updateHash: true
    useAnimations: true
    useFastTouch: true
    useTouchScroll: true

  @addExtension = (extension) ->
    @::extensions.push extension

  @addTapHandler = (tapHandler) ->
    @::tapHandlers.push tapHandler  if typeof (tapHandler.name) is "string" and typeof (tapHandler.isSupported) is "function" and typeof (tapHandler.fn) is "function"

  @addAnimation = (animation) ->
    @animations.push animation if typeof (animation.selector) is "string" and typeof (animation.name) is "string"

  # PRIVATE DATA

  $body = undefined
  $head = $("head")
  animations = @::animations
  customHistory = []
  newPageCount = 0
  $currentPage = ""
  touchSelectors = []
  tapBuffer = 100

  constructor: (options) ->
    @tapHandlers = @tapHandlers.concat [
      name: "external-link"
      isSupported: (e, params) -> isExternalLink params.$el
      fn: (e, params) ->
        params.$el.removeClass 'active'
        true
    ,
      name: "back-selector"
      isSupported: (e, params) =>
        params.$el.is @settings.backSelector
      fn: (e, params) =>
        # User clicked or tapped a back button
        @goBack params.hash
        false
    ,
      name: "submit-selector"
      isSupported: (e, params) =>
        params.$el.is @settings.submitSelector
      fn: (e, params) ->
        # User clicked or tapped a submit element
        submitParentForm params.$el
        return
    ,
      name: "webapp"
      isSupported: (e, params) ->
        params.target is "_webapp"

      fn: (e, params) ->
        # User clicked or tapped an internal link, fullscreen mode
        window.location = params.href
        false
    ,
      name: "no-op"
      isSupported: (e, params) ->
        params.href is "#"

      fn: (e, params) ->
        # Allow tap on item with no href
        params.$el.removeClass 'active'
        true
    ,
      name: "standard"
      isSupported: (e, params) ->
        params.hash and params.hash isnt "#"

      fn: (e, params) =>
        animation = getAnimation(params.$el)

        # Internal href
        params.$el.addClass "active"
        @goTo $(params.hash).data("referrer", params.$el), animation, params.$el.hasClass("reverse")
        false
    ,
      name: "external"
      isSupported: (e, params) -> true
      fn: (e, params) ->
        animation = getAnimation(params.$el)

        # External href
        params.$el.addClass "loading active"
        showPageByHref params.$el.attr("href"),
          animation: animation
          callback: ->
            params.$el.removeClass "loading"
            setTimeout ->
              params.$el.removeClass('active')
            , 250

          $referrer: params.$el

        false
    ]

    @goTo = (toPage, animation) =>
      fromPage = customHistory[0].page

      if typeof animation is "string"
        for anim in animations
          if anim.name is animation
            animation = anim
            break

      if typeof toPage is "string"
        nextPage = $(toPage)
        unless nextPage.length
          showPageByHref toPage,
            animation: animation

          return
        else
          toPage = nextPage
      if doNavigation(fromPage, toPage, animation)
        @
      else
        console.warn "Could not animate pages."
        return false

      return

    @goBack = (toPage) =>
      # Error checking
      console.warn "History is empty." if customHistory.length < 1
      if customHistory.length is 1
        console.warn "You are on the first panel."
        window.history.go -1

      # Go back an arbitrary number of internal pages.
      if typeof toPage == 'number'
        if toPage > 0
          customHistory.splice 1, toPage
        else if toPage < 0
          customHistory.splice 1, customHistory.length + toPage - 1

      # Go back to a specific page defined by a hash
      # independent of its place in history.
      else if /^#.+/.test toPage
        end = 0

        for h, i in customHistory
          if h.hash == toPage
            end = i
            break

        customHistory.splice 1, end - 1

      from = customHistory[0]
      to = customHistory[1]

      return unless from? and to?

      if doNavigation(from.page, to.page, from.animation, true)
        @
      else
        console.warn "Could not go back."
        return false

      return

    @history = customHistory

    # PRIVATE METHODS

    initHairExtensions = (options) =>

      # Preload images
      for i in @settings.preloadImages
        (new Image()).src = @settings.preloadImages[i]

      hairExtensions = []

      # Set appropriate icon
      # (retina display available in iOS 4.2 and later.)
      precomposed = if @settings.addGlossToIcon then '' else '-precomposed'
      hairExtensions.push """<link rel="apple-touch-icon#{precomposed}" href="#{@settings.icon}">""" if @settings.icon
      hairExtensions.push """<link rel="apple-touch-icon#{precomposed}" sizes="114x114" href="#{@settings.icon4}">"""  if @settings.icon4

      # Set startup screen
      hairExtensions.push """<link rel="apple-touch-startup-image" href="#{@settings.startupScreen}">""" if @settings.startupScreen

      # Set viewport
      hairExtensions.push """<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0">""" if @settings.fixedViewport

      # Set full-screen
      if @settings.fullScreen
        hairExtensions.push """<meta name="apple-mobile-web-app-capable" content="yes" />"""
        hairExtensions.push """<meta name="apple-mobile-web-app-status-bar-style" content="#{@settings.statusBar}">""" if @settings.statusBar

      # Attach hair extensions
      $head.prepend hairExtensions.join '' if hairExtensions.length

    insertPages = (nodes, animation) =>
      # Call dom.createElement element directly
      # instead of relying on $(nodes), to work around:
      # https://github.com/madrobby/zepto/issues/312

      # DK: This is allegedly fixed...
      # div = document.createElement("div")
      # div.innerHTML = nodes
      targetPage = null

      $(nodes).each (index, node) ->
        $node = $(this)
        $node.attr "id", "page-" + (++newPageCount) unless $node.attr("id")

        # Remove any existing instances
        $("#" + $node.attr("id")).remove()

        $body.append $node
        $body.trigger "pageInserted",
          page: $node

        targetPage = $node if $node.hasClass("current") or not targetPage

      if targetPage?
        @goTo targetPage, animation
        targetPage
      else
        return false

      return

    # Private functions

    addPageToHistory = (page, animation) ->
      id = page.attr 'id'

      customHistory.unshift
        page: page
        animation: animation
        hash: "#" + id
        id: id

    # Unfortunately, we can not assume the 'tap' event
    # is being used for links, forms, etc.
    clickHandler = (e) =>
      $el = $(e.target)

      # Find the nearest tappable ancestor
      $el = $el.closest(touchSelectors.join(", ")) unless $el.is(touchSelectors.join(", "))

      # Prevent default if we found an internal link
      # (relative or absolute)
      if $el and $el.attr("href") and not isExternalLink($el)
        console.warn "Need to prevent default click behavior."
        e.preventDefault()
      else
        console.warn "No need to prevent default click behavior."

      # Trigger a tap event if touchstart is not on the job
      unless support.touch
        console.warn "Converting click event to a tap event because touch handlers are not present or off."
        $(e.target).trigger "tap", e

      return

    # Fires when the history state changes
    hashChangeHandler = (e) =>
      if location.hash is customHistory[0].hash
        console.log "We are on the right panel."
        return true
      else if location.hash is ""
        @goBack()
        return true
      else if customHistory[1] and location.hash is customHistory[1].hash
        @goBack()
        return true
      else
        # Lastly, just try going to the ID...
        console.warn "Could not find ID in history, just forwarding to DOM element."
        @goTo $(location.hash), @settings.defaultAnimation

      return

    isExternalLink = ($el) ->
      $el.attr("target") is "_blank" or $el.attr("rel") is "external" or $el.is("a[href^=\"http://maps.google.com\"], a[href^=\"mailto:\"], a[href^=\"tel:\"], a[href^=\"javascript:\"], a[href*=\"youtube.com/v\"], a[href*=\"youtube.com/watch\"]")

    getAnimation = ($el) =>
      for animation in animations
        if $el.is(animation.selector)
          resultAnimation = animation
          break
      unless resultAnimation
        console.warn "Animation could not be found. Using " + @settings.defaultAnimation + "."
        resultAnimation = @settings.defaultAnimation

      resultAnimation

    showPageByHref = (href, options) =>

      options = $.extend {},
        data: null
        method: "GET"
        animation: null
        $referrer: null
      , options

      unless href.charAt(0) is '#'
        $.ajax
          url: href
          data: options.data
          type: options.method
          success: (data) =>
            firstPage = insertPages(data, options.animation)

            if firstPage
              options.$referrer.attr "href", "#" + firstPage.attr("id") if options.method is "GET" and @settings.cacheGetRequests is true and options.$referrer
              # settings.callback true  if settings.callback

          error: (data) ->
            options.$referrer.removeClass('active') if options.$referrer
            # settings.callback false  if settings.callback

      else options.$referrer.removeClass('active') if options.$referrer

    support = undefined

    start = =>

      # Store some properties in a support object
      support = $.support || {}

      $.extend support,
        animationEvents: (typeof window.WebKitAnimationEvent isnt "undefined")
        touch: (typeof window.TouchEvent isnt "undefined") and (window.navigator.userAgent.indexOf("Mobile") > -1) and @settings.useFastTouch
        transform3d: ->
          head = $head.get(0)
          body = document.body
          style = document.createElement("style")
          style.textContent = "@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-webkit-transform-3d){#jqt-3dtest{height:3px}}"
          div = document.createElement("div")
          div.id = "jqt-3dtest"

          # Add to the page
          head.appendChild style
          body.appendChild div

          # Check the result
          result = div.offsetHeight is 3

          # Clean up
          style.parentNode.removeChild style
          div.parentNode.removeChild div

          # Pass back result
          console.warn "Support for 3d transforms: " + result + "."
          result

      console.warn "This device does not support touch interaction, or it has been deactivated by the developer. Some features might be unavailable." unless support.touch
      console.warn "This device does not support 3d animation. 2d animations will be used instead."  unless support.transform3d

      # Add extensions
      for extFn in @extensions
        $.extend @, extFn(@) if $.isFunction(extFn)

      # Create an array of stuff that needs touch event handling
      touchSelectors.push @settings.touchSelector.concat(@settings.backSelector,@settings.submitSelector)
      $touchSelectors = $(touchSelectors.join(', ')).css '-webkit-touch-callout', 'none'

      # Make sure we have a jqt element
      $body = $("#jqt")
      anatomyLessons = []

      unless $body.length
        console.warn "Could not find an element with the id “jqt”, so the body id has been set to \"jqt\". If you are having any problems, wrapping your panels in a div with the id “jqt” might help."
        $body = $(document.body).attr("id", "jqt")

      anatomyLessons.push "supports3d" if support.transform3d

      anatomyLessons.push if @settings.useTouchScroll
        'touchscroll'
      else
        'autoscroll'

      anatomyLessons.push @settings.fullScreenClass, @settings.statusBar if @settings.fullScreenClass and window.navigator.standalone

      # Add classes to the body, delegate all our events and trigger an orientation change
      $body.addClass(anatomyLessons.join(" "))
        .bind("click", clickHandler)
        .bind("orientationchange", orientationChangeHandler)
        .bind("submit", submitHandler)
        .bind("tap", tapHandler)
        .bind((if support.touch then "touchstart" else "mousedown"), touchStartHandler)
        .trigger "orientationchange"

      $(window).bind("hashchange", hashChangeHandler) if @settings.updateHash
      startHash = location.hash

      # Determine what the initial view should be
      unless $("#jqt > .current").length
        $currentPage = $("#jqt > *:first-child").addClass("current")
      else
        $currentPage = $("#jqt > .current")

      setHash $currentPage.attr("id")

      addPageToHistory $currentPage

      @goTo(startHash) if @settings.updateHash and $(startHash).length

    orientationChangeHandler = ->
      # Scroll to top if we change orientation
      scrollTo 0, 0

      orientation = (if Math.abs(window.orientation) is 90 then "landscape" else "portrait")
      $body.removeClass("portrait landscape").addClass(orientation).trigger "turn",
        orientation: orientation

    reverseAnimation = (animation) ->
      opposites =
        up: "down"
        down: "up"
        left: "right"
        right: "left"
        in: "out"
        out: "in"

      opposites[animation] or animation

    setHash = (hash) =>
      location.hash = "#" + hash.replace(/^#/, "") if @settings.updateHash

    submitHandler = (e, callback) =>
      $(":focus").trigger "blur"

      $form = (if (typeof (e) is "string") then $(e).eq(0) else ((if e.target then $(e.target) else $(e))))

      if $form.length and $form.is(@settings.formSelector) and $form.attr("action")
        e.preventDefault()

        showPageByHref $form.attr("action"),
          data: $form.serialize()
          method: $form.attr("method") or "POST"
          animation: getAnimation($form)
          callback: callback

    submitParentForm = ($el) ->
      $form = $el.closest("form")

      if $form.length
        console.warn "About to submit parent form."
        $form.trigger "submit"
        false
      else
        console.warn "No parent form found."
        true

    tapHandler = (e) =>
      # Exit out if the user has already called preventDefault on this event.
      return true if e.isDefaultPrevented()

      $el = $(e.target)
      selectors = touchSelectors.join ','

      # Find the nearest tappable ancestor
      $el = $el.closest(selectors) unless $el.is(selectors)

      # Make sure we have a tappable element
      if not $el.length or not $el.attr("href")
        console.warn "Could not find a link related to tapped element."
        return true

      # Init some vars
      target = $el.attr("target")
      hash = $el.prop("hash")
      href = $el.attr("href")
      params =
        e: e
        $el: $el
        target: target
        hash: hash
        href: href

      # Loop thru all handlers
      for handler in @tapHandlers
        return flag = handler.fn(e, params) if handler.isSupported(e, params)

      return

    touchStartHandler = (e) ->
      $el = $(e.target)
      selectors = touchSelectors.join(", ")

      # Find the nearest tappable ancestor
      $el = $el.closest(selectors) unless $el.is(selectors)

      # Make sure we have a tappable element
      $el.addClass "active" if $el.length and $el.attr("href")

      # Remove our active class if we move
      $el.on (if support.touch then "touchmove" else "mousemove"), ->
        $el.removeClass "active"
      $el.on "touchend", ->
        $el.unbind "touchmove mousemove"

    doNavigation = (fromPage, toPage, animation, goingBack=no) =>

      # Private navigationEnd callback
      navigationEndHandler = (event) =>
        if support.animationEvents and animation and @settings.useAnimations
          fromPage.unbind "webkitAnimationEnd", navigationEndHandler
          fromPage.removeClass finalAnimationName + " out"
          toPage.removeClass finalAnimationName  if finalAnimationName
          $body.removeClass "animating animating3d"

        else
          fromPage.removeClass finalAnimationName + " out"
          toPage.removeClass finalAnimationName if finalAnimationName

        # 'in' class is intentionally delayed,
        # as it is our ghost click hack
        setTimeout ->
          toPage.removeClass 'in'
          window.scroll 0, 0
        , tapBuffer

        fromPage.find('.active').removeClass 'active'

        # Trigger custom events
        toPage.trigger "pageAnimationEnd",
          direction: "in"
          animation: animation
          back: goingBack

        fromPage.trigger "pageAnimationEnd",
          direction: "out"
          animation: animation
          back: goingBack

      # Error check current page
      unless toPage.length
        $('.active').removeClass('active')
        console.warn "Target element is missing."
        return false
      if toPage.hasClass("current")
        $('.active').removeClass 'active'
        console.warn "You are already on the page you are trying to navigate to."
        return false

      # Collapse the keyboard
      $(":focus").trigger "blur"

      fromPage.trigger "pageAnimationStart",
        direction: "out"
        back: goingBack

      toPage.trigger "pageAnimationStart",
        direction: "in"
        back: goingBack

      if support.animationEvents and animation and @settings.useAnimations

        finalAnimationName = animation.name
        is3d = if animation.is3d then " animating3d" else ""

        # Fail over to 2d animation if need be
        if not support.transform3d and animation.is3d
          console.warn "Did not detect support for 3d animations, falling back to " + @settings.defaultAnimation + "."
          finalAnimationName = @settings.defaultAnimation
          is3d = ''

        # Reverse animation if need be
        finalAnimationName = finalAnimationName.replace(/left|right|up|down|in|out/, reverseAnimation) if goingBack

        finalAnimationName ?= @settings.defaultAnimation
        console.warn "finalAnimationName:", finalAnimationName

        # Bind internal 'cleanup' callback
        fromPage.bind "webkitAnimationEnd", navigationEndHandler
        $body.addClass "animating#{is3d}"

        # Trigger animations
        toPage.addClass finalAnimationName + " in current"
        fromPage.removeClass("current").addClass finalAnimationName + " out"

      else
        toPage.addClass "current in"
        fromPage.removeClass "current"
        navigationEndHandler()
      $currentPage = toPage
      if goingBack
        customHistory.shift()
      else
        addPageToHistory $currentPage, animation
      setHash $currentPage.attr("id")
      true

    # FINAL PART OF CONSTRUCTOR

    # Apply the options against our defaults
    @settings = $.extend({}, @defaults, options)

    # Add meta tags and body classes
    initHairExtensions()

    @settings.starter start

# Added for backward-compatibility
$.jQTouch = $.jQT
