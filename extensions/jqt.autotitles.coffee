if $.jQT
  $.jQT.addExtension (jQT) ->
    titleSelector = '.toolbar h1'

    # Bind events on document.ready
    $ ->
      $('#jqt').bind 'pageAnimationStart', (e, data) ->
        $el = $(e.target)
        
        if data.direction is 'in'
          $title = $(titleSelector, $el)
          $ref = $el.data('referrer')

          
          $title.html($ref.text()) if $title.length and $ref

      # Public function added to jQT instance
      setTitleSelector = (sel) -> titleSelector = sel

      return setTitleSelector: setTitleSelector