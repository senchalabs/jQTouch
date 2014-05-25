if $.jQT
  $.jQT.addExtension (jQT) ->

    $('[data-switch-stylesheet]').live 'tap', ->
      switchStyleSheet $(this).attr('data-stylesheet-title'), $(this).attr('data-switch-stylesheet')

      # Manage buttons/links set for changing stylesheet
      $('[data-switch-stylesheet]').removeClass('selected')
      $(this).addClass('selected')

      false

    switchStyleSheet = (newStyleTitle, newStyle) ->

      $link = $("""link[title="#{newStyleTitle}"]""")

      newHref = if $link.length # Using a link title to change stylesheet
        $link.attr('href')
      else # Using a direct path
        newStyle

      $('link[data-jqt-theme]').attr('href', newHref)

      $('#jqt').attr('data-jqt-theme', newStyleTitle)

    # Extend jQT object
    switchStyleSheet: switchStyleSheet