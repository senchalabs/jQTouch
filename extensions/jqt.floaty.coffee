if $.jQT
  $.jQT.addExtension (jQT) ->

    $.fn.makeFloaty = (options) ->
      settings = $.extend {}, 
        align: 'top'
        spacing: 20
        time: '.3s'
      , options

      # Only allow top/bottom for now
      settings.align = 'bottom' if settings.align isnt 'top'

      this.each ->
        $el = $(this)
        $el
          .css
            '-webkit-transition': 'top ' + settings.time + ' ease-in-out'
            'display': 'block'
            'min-height': '0 !important'
          .data 'settings', settings
        
        $(document).scroll ->
          $el.scrollFloaty() if $el.data('floatyVisible')

        $el.scrollFloaty()

    $.fn.scrollFloaty = ->
      this.each ->
        $el = $(this)
        settings = $el.data('settings')
        wHeight = $('html').attr('clientHeight')
        newY = window.pageYOffset + if settings.align is 'top' then settings.spacing else wHeight - settings.spacing - $el.get(0).offsetHeight
        
        $el.css('top', newY).data 'floatyVisible', yes

    $.fn.hideFloaty = ->
      this.each ->
        $el = $(this)
        oh = $el.get(0).offsetHeight
        $el.css('top', -oh-10).data 'floatyVisible', no

    $.fn.toggleFloaty = ->
      this.each ->
        $el = $(this)
        if $el.data('floatyVisible')
          $el.hideFloaty()
        else
          $el.scrollFloaty()