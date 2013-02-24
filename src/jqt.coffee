class $.jQT
  extensions: []
  animations: []
  history: []
  settings: {}
  orientation: 'portrait'

  addAnimation: ->
    @::animations.push animation if typeof (animation.selector) is "string" and typeof (animation.name) is "string"
  addTapHandler: ->
    tapHandlers.push tapHandler  if typeof (tapHandler.name) is "string" and typeof (tapHandler.isSupported) is "function" and typeof (tapHandler.fn) is "function"
  getOrientation: ->
  addTapHandler: (extension) ->
    @::tapHandlers.push extension
  goBack: ->
    # Error checking
    console.warn "History is empty." if history.length < 1
    if history.length is 1
      console.warn "You are on the first panel."
      window.history.go -1
    from = history[0]
    to = history[1]
    if doNavigation(from.page, to.page, from.animation, true)
      publicObj
    else
      console.warn "Could not go back."
      false

  insertPages: (nodes, animation) ->    
    # Call dom.createElement element directly
    # instead of relying on $(nodes), to work around:
    # https://github.com/madrobby/zepto/issues/312

    # DK: This is allegedly fixed...
    # div = document.createElement("div")
    # div.innerHTML = nodes

    $(nodes).children().each (index, node) ->
      $node = $(this)
      $node.attr "id", "page-" + (++newPageCount) unless $node.attr("id")
      
      # Remove any existing instances
      $("#" + $node.attr("id")).remove()

      $body.append $node
      $body.trigger "pageInserted",
        page: $node

      targetPage = $node if $node.hasClass("current") or not targetPage

    if targetPage?
      goTo targetPage, animation
      targetPage
    else
      false

  goTo: (toPage, animation) ->
    fromPage = history[0].page

    if typeof animation is "string"
      for i in animations
        if animations[i].name is animation
          animation = animations[i]
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
      publicObj
    else
      console.warn "Could not animate pages."
      false

  # PRIVATE DATA

  $body = undefined
  $head = $("head")
  history = []
  newPageCount = 0
  jQTSettings = {}
  $currentPage = ""
  touchSelectors = []
  publicObj = {}
  tapBuffer = 100
  extensions = $.jQT::extensions
  extTapHandlers = $.jQT::tapHandlers
  tapHandlers = []
  animations = []
  defaults =
    addGlossToIcon: true
    backSelector: ".back, .cancel, .goback"
    cacheGetRequests: true
    debug: true
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
    trackScrollPositions: true
    updateHash: true
    useAnimations: true
    useFastTouch: true
    useTouchScroll: true
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

  # Private functions

  addPageToHistory = (page, animation) ->
    id = page.attr 'id'

    history.unshift
      page: page
      animation: animation
      hash: "#" + id
      id: id

  addDefaultTapHandlers = ->
    addTapHandler
      name: "external-link"
      isSupported: (e, params) -> isExternalLink params.$el

      fn: (e, params) ->
        params.$el.removeClass 'active'
        true

    addTapHandler
      name: "back-selector"
      isSupported: (e, params) ->
        params.$el.is params.jQTSettings.backSelector

      fn: (e, params) ->
        
        # User clicked or tapped a back button
        goBack params.hash

    addTapHandler
      name: "submit-selector"
      isSupported: (e, params) ->
        params.$el.is params.jQTSettings.submitSelector

      fn: (e, params) ->
        
        # User clicked or tapped a submit element
        submitParentForm params.$el

    addTapHandler
      name: "webapp"
      isSupported: (e, params) ->
        params.target is "_webapp"

      fn: (e, params) ->
        
        # User clicked or tapped an internal link, fullscreen mode
        window.location = params.href
        false

    addTapHandler
      name: "no-op"
      isSupported: (e, params) ->
        params.href is "#"

      fn: (e, params) ->
        
        # Allow tap on item with no href
        params.$el.removeClass 'active'
        true

    addTapHandler
      name: "standard"
      isSupported: (e, params) ->
        params.hash and params.hash isnt "#"

      fn: (e, params) ->
        animation = getAnimation(params.$el)
        
        # Internal href
        params.$el.addClass "active"
        goTo $(params.hash).data("referrer", params.$el), animation, params.$el.hasClass("reverse")
        false

    addTapHandler
      name: "external"
      isSupported: (e, params) ->
        true

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

  # Unfortunately, we can not assume the 'tap' event
  # is being used for links, forms, etc.
  clickHandler = (e) ->
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
    if $.support.touch
      console.warn "Not converting click to a tap event because touch handler is on the job."
    else
      console.warn "Converting click event to a tap event because touch handlers are not present or off."
      $(e.target).trigger "tap", e
  
  doNavigation = (fromPage, toPage, animation, goingBack) ->
        
    # Private navigationEnd callback
    navigationEndHandler = (event) ->
      bufferTime = tapBuffer
      if $.support.animationEvents and animation and jQTSettings.useAnimations
        fromPage.unbind "webkitAnimationEnd", navigationEndHandler
        fromPage.removeClass finalAnimationName + " out inmotion"
        toPage.removeClass finalAnimationName  if finalAnimationName
        $body.removeClass "animating animating3d"

        # Position the incoming page so toolbar is at top of
        # viewport regardless of scroll position on from page
        if jQTSettings.trackScrollPositions is true
          toPage.css "top", -toPage.data("lastScroll")
          
          # Have to make sure the scroll/style resets
          # are outside the flow of this function.
          setTimeout ->
            toPage.css "top", 0
            window.scroll 0, toPage.data("lastScroll")
            $(".scroll", toPage).each ->
              @scrollTop = -$(this).data("lastScroll")
          , 0
      else
        fromPage.removeClass finalAnimationName + " out inmotion"
        toPage.removeClass finalAnimationName if finalAnimationName
        bufferTime += 260
      
      # 'in' class is intentionally delayed,
      # as it is our ghost click hack
      setTimeout ->
        toPage.removeClass "in"
        window.scroll 0, 0
      , bufferTime

      fromPage.unselect()
      
      # Trigger custom events
      toPage.trigger "pageAnimationEnd",
        direction: "in"
        animation: animation
        back: goingBack

      fromPage.trigger "pageAnimationEnd",
        direction: "out"
        animation: animation
        back: goingBack

    goingBack = (if goingBack then goingBack else false)

    # Error check current page
    unless toPage.length
      $('.active').removeClass('active')
      warn "Target element is missing."
      return false
    if toPage.hasClass("current")
      $.fn.unselect()
      warn "You are already on the page you are trying to navigate to."
      return false

    # Collapse the keyboard
    $(":focus").trigger "blur"

    fromPage.trigger "pageAnimationStart",
      direction: "out"
      back: goingBack

    toPage.trigger "pageAnimationStart",
      direction: "in"
      back: goingBack

    if $.support.animationEvents and animation and jQTSettings.useAnimations
      # Fail over to 2d animation if need be
      if not $.support.transform3d and animation.is3d
        warn "Did not detect support for 3d animations, falling back to " + jQTSettings.defaultAnimation + "."
        animation.name = jQTSettings.defaultAnimation

      finalAnimationName = animation.name
      is3d = (if animation.is3d then "animating3d" else "")

      # Reverse animation if need be
      finalAnimationName = finalAnimationName.replace(/left|right|up|down|in|out/, reverseAnimation)  if goingBack
      
      warn "finalAnimationName is " + finalAnimationName + "."

      # Bind internal 'cleanup' callback
      fromPage.bind "webkitAnimationEnd", navigationEndHandler
      $body.addClass "animating " + is3d
      lastScroll = window.pageYOffset
      toPage.css "top", window.pageYOffset - (toPage.data("lastScroll") or 0)  if jQTSettings.trackScrollPositions is true

      # Trigger animations
      toPage.addClass finalAnimationName + " in current"
      fromPage.removeClass("current").addClass finalAnimationName + " out inmotion"

      if jQTSettings.trackScrollPositions
        fromPage.data "lastScroll", lastScroll
        $(".scroll", fromPage).each ->
          $(this).data "lastScroll", @scrollTop

    else
      toPage.addClass "current in"
      fromPage.removeClass "current"
      navigationEndHandler()
    $currentPage = toPage
    if goingBack
      history.shift()
    else
      addPageToHistory $currentPage, animation
    setHash $currentPage.attr("id")
    true

  # Fires when the history state changes
  hashChangeHandler = (e) ->
    if location.hash is history[0].hash
      console.warn "We are on the right panel."
      true
    else if location.hash is ""
      goBack()
      true
    else if history[1] and location.hash is history[1].hash
      goBack()
      true
    else
      # Lastly, just try going to the ID...
      console.warn "Could not find ID in history, just forwarding to DOM element."
      goTo $(location.hash), jQTSettings.defaultAnimation

  initHairExtensions = (options) ->
    
    # Preload images  
    for i in jQTSettings.preloadImages
      (new Image()).src = jQTSettings.preloadImages[i]
    
    hairExtensions = []

    # Set appropriate icon
    # (retina display available in iOS 4.2 and later.)
    precomposed = if jQTSettings.addGlossToIcon then '' else '-precomposed'
    hairExtensions.push """<link rel="apple-touch-icon#{precomposed}" href="#{jQTSettings.icon}">""" if jQTSettings.icon
    hairExtensions.push """<link rel="apple-touch-icon#{precompsed}" sizes="114x114" href="#{jQTSettings.icon4}">"""  if jQTSettings.icon4
    
    # Set startup screen
    hairExtensions.push """<link rel="apple-touch-startup-image" href="#{jQTSettings.startupScreen}">""" if jQTSettings.startupScreen
    
    # Set viewport
    hairExtensions.push """<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0">""" if jQTSettings.fixedViewport
    
    # Set full-screen
    if jQTSettings.fullScreen
      hairExtensions.push """<meta name="apple-mobile-web-app-capable" content="yes" />"""
      hairExtensions.push """<meta name="apple-mobile-web-app-status-bar-style" content="#{jQTSettings.statusBar}">""" if jQTSettings.statusBar
    
    # Attach hair extensions
    $head.prepend hairExtensions.join '' if hairExtensions.length
  
  isExternalLink: ($el) ->      
    $el.attr("target") is "_blank" or $el.attr("rel") is "external" or $el.is("a[href^=\"http://maps.google.com\"], a[href^=\"mailto:\"], a[href^=\"tel:\"], a[href^=\"javascript:\"], a[href*=\"youtube.com/v\"], a[href*=\"youtube.com/watch\"]")
  
  getAnimation = ($el) ->
    for i in animations
      if $el.is(animations[i].selector)
        animation = animations[i]
        break
    unless animation
      console.warn "Animation could not be found. Using " + jQTSettings.defaultAnimation + "."
      animation = jQTSettings.defaultAnimation
    
    animation

  showPageByHref = (href, options) ->

    settings = $.extend {}, 
      data: null
      method: "GET"
      animation: null
      # callback: null
      $referrer: null
    , options

    unless href is '#'
      $.ajax
        url: href
        data: settings.data
        type: settings.method
        success: (data) ->
          firstPage = insertPages(data, settings.animation)

          if firstPage
            settings.$referrer.attr "href", "#" + firstPage.attr("id") if settings.method is "GET" and jQTSettings.cacheGetRequests is true and settings.$referrer
            # settings.callback true  if settings.callback

        error: (data) ->
          settings.$referrer.removeClass('active') if settings.$referrer
          # settings.callback false  if settings.callback

    else settings.$referrer.removeClass('active') if settings.$referrer

  start = ->
    
    # Store some properties in a support object
    $.support ||= {}

    $.extend $.support,
      animationEvents: (typeof window.WebKitAnimationEvent isnt "undefined")
      touch: (typeof window.TouchEvent isnt "undefined") and (window.navigator.userAgent.indexOf("Mobile") > -1) and jQTSettings.useFastTouch
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

    console.warn "This device does not support touch interaction, or it has been deactivated by the developer. Some features might be unavailable." unless $.support.touch
    console.warn "This device does not support 3d animation. 2d animations will be used instead."  unless $.support.transform3d
    
    # Add extensions
    for i in extensions
      fn = extensions[i]
      $.extend publicObj, fn(publicObj) if $.isFunction(fn)
    
    # Add extensions tapHandlers
    addTapHandler extTapHandlers[i] for i in extTapHandlers
    
    # Add default tapHandlers
    addDefaultTapHandlers()
    
    # Add animations
    for i in defaults.animations
      animation = defaults.animations[i]
      animation.selector = jQTSettings[animation.name + "Selector"]  if jQTSettings[animation.name + "Selector"] isnt `undefined`
      addAnimation animation

    # Create an array of stuff that needs touch event handling
    touchSelectors.push jQTSettings.touchSelector.concat(jQTSettings.backSelentor,jQTSettings.submitSelector)
    $touchSelectors = $(touchSelectors.join(', ')).css '-webkit-touch-callout', 'none'
    
    # Make sure we have a jqt element
    $body = $("#jqt")
    anatomyLessons = []

    unless $body.length
      console.warn "Could not find an element with the id “jqt”, so the body id has been set to \"jqt\". If you are having any problems, wrapping your panels in a div with the id “jqt” might help."
      $body = $(document.body).attr("id", "jqt")
    
    anatomyLessons.push "supports3d" if $.support.transform3d

    anatomyLessons.push if jQTSettings.useTouchScroll
      'touchscroll'
    else
      'autoscroll'

    anatomyLessons.push jQTSettings.fullScreenClass, jQTSettings.statusBar if jQTSettings.fullScreenClass and window.navigator.standalone
    
    # Add classes to the body, delegate all our events and trigger an orientation change
    $body.addClass(anatomyLessons.join(" "))
      .bind("click", clickHandler)
      .bind("orientationchange", orientationChangeHandler)
      .bind("submit", submitHandler)
      .bind("tap", tapHandler)
      .bind((if $.support.touch then "touchstart" else "mousedown"), touchStartHandler)
      .trigger "orientationchange"

    $(window).bind "hashchange", hashChangeHandler
    startHash = location.hash
    
    # Determine what the initial view should be
    if $("#jqt > .current").length
      $currentPage = $("#jqt > *:first-child").addClass("current")
    else
      $currentPage = $("#jqt > .current")

    setHash $currentPage.attr("id")
    addPageToHistory $currentPage
    goTo startHash  if $(startHash).length

  orientationChangeHandler = ->
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

  setHash = (hash) ->
    location.hash = "#" + hash.replace(/^#/, "") if jQTSettings.updateHash
  
  submitHandler = (e, callback) ->
    $(":focus").trigger "blur"
    e.preventDefault()
    $form = (if (typeof (e) is "string") then $(e).eq(0) else ((if e.target then $(e.target) else $(e))))

    if $form.length and $form.is(jQTSettings.formSelector) and $form.attr("action")
      showPageByHref $form.attr("action"),
        data: $form.serialize()
        method: $form.attr("method") or "POST"
        animation: getAnimation($form)
        callback: callback

      return false
    true

  submitParentForm = ($el) ->
    $form = $el.closest("form")
      
    if $form.length
      warn "About to submit parent form."
      $form.trigger "submit"
      false
    else
      warn "No parent form found."
      true

  tapHandler = (e) ->
    return true if e.isDefaultPrevented()
        
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
      jQTSettings: jQTSettings

    
    # Loop thru all handlers
    for i in tapHandlers
      handler = tapHandlers[i]
      supported = handler.isSupported(e, params)
      if supported
        flag = handler.fn(e, params)
        return flag

  touchStartHandler = (e) ->
    $el = $(e.target)
    selectors = touchSelectors.join(", ")
    
    # Find the nearest tappable ancestor
    $el = $el.closest(selectors) unless $el.is(selectors)
    
    # Make sure we have a tappable element
    $el.addClass "active" if $el.length and $el.attr("href")
    
    # Remove our active class if we move
    $el.on (if $.support.touch then "touchmove" else "mousemove"), ->
      $el.removeClass "active"
    $el.on "touchend", ->
      $el.unbind "touchmove mousemove"

  # Initialize the class
  jQTSettings = $.extend({}, defaults, options)
  initHairExtensions options
  initFXExtensions()
  jQTSettings.starter start