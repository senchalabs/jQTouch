module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-coverjs"
  grunt.loadNpmTasks "grunt-contrib-qunit"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-compass"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-mincss"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-livereload"
  grunt.loadNpmTasks "grunt-update-submodules"

  grunt.registerMultiTask "rake", "Compile a Ruby Package with Rake", ->
    cb = @async() # Tell grunt the task is async
    options = @data["options"]
    params = grunt.template.process(@data["params"])
    exec = require("child_process").exec
    child = exec("rake " + params + "", options, (error, stdout, stderr) ->
      console.log "stdout: " + stdout if stdout
      
      if error isnt null
        console.log "error: " + error
        console.log "stderr: " + stdout
      cb() # Execute the callback when the async task is done
    )

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    meta:
      version: "<%= pkg.version %>-<%= pkg.versionId %>"
      banner: """
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

           (c) 2009-<%= grunt.template.today("yyyy") %> Sencha Labs

           Version: <%= meta.version %> - <%= grunt.template.today("yyyy-mm-dd") %>

           jQTouch may be freely distributed under the MIT license.
        */\n
      """
    dirs:
      src: "src"
      build: "build" # change back to `build` when you port away from ant`.
      dist: "jqtouch-<%= pkg.version %>-<%= pkg.versionId %>"
      css: "<%= dirs.build %>/themes/css"

    clean:
      build: ["<%= dirs.build %>"]
      dist: ["<%= dirs.dist %>"]

    coffee:
      jqt:
        expand: yes
        cwd: 'src'
        src: ['**.coffee']
        dest: '<%= dirs.build %>/src/'
        ext: '.js'

      extensions:
        expand: yes
        cwd: 'extensions'
        src: ['**.coffee']
        dest: '<%= dirs.build %>/extensions/'
        rename: (dest, path) ->
          dest + path.replace /\.coffee$/, '.js'

    copy:
      prepare:
        expand: true
        src: ["*/**", "!{test,node_modules,build,submodules,jqtouch*,themes/compass-recipes,themes/scss}/**", "*.{md,txt,htaccess}"]
        dest: "<%= dirs.build %>/"

      source:
        expand: yes
        cwd: 'src'
        src: ["**/*.js"]
        dest: "<%= dirs.build %>/src/"

      dist:
        files: [
          expand: yes
          dest: '<%= dirs.dist %>/'
          src: '**/*'
          cwd: '<%= dirs.build %>'
        ,
          src: "<%= dirs.build %>/sample.htaccess"
          dest: "<%= dirs.dist %>/.htaccess"
        ]

        options:
          processContent: (content, path) ->
            # Strip warnings from JavaScript
            if path.match /\.js$/
              content.replace /\n\s*warn\(.*/g, ''

            # Update to minified JS/CSS paths in HTML
            else if path.match /\.html$/
              content
                .replace(/([\w-\.]*)(\.min)?\.js/g, '$1.min.js')
                .replace(/(themes\/css\/[\w-\.]*)(\.min)?\.css/g, '$1.min.css')

            else
              content
      test:
        expand: yes
        cwd: '<%= dirs.build %>'
        dest: 'test/build/'
        src: '**/*'
        
      zepto:
        files: [
          expand: yes
          cwd: 'submodules/zepto/dist/'
          src: 'zepto.js'
          dest: '<%= dirs.build %>/lib/zepto'
        ,
          src: 'submodules/zepto/src/touch.js'
          dest: '<%= dirs.build %>/src/jqtouch-jquery.js'
        ]

      "jquery-bridge":
        options:
          # Convert Zepto's touch class to work for jQuery
          processContent: (content) ->
            content
              .replace(/e\.touches/g, '(e.originalEvent||e).touches')
              .replace('(Zepto)', '(jQuery)')

        files:
          "<%= dirs.build %>/src/jqtouch-jquery.js": ["submodules/zepto/src/touch.js"]

    rake:
      zepto:
        params: "concat[fx:ajax:data:detect:event:form:polyfill:touch]"
        options:
          cwd: "submodules/zepto"

    compass:
      compile:
        options:
          load: 'submodules/compass-recipes/'
          sassDir: 'themes/scss'
          cssDir: '<%= dirs.css %>'
    
    # Concat is only used to add our banner
    concat:        
      banner:
        expand: yes
        cwd: '<%= dirs.build %>/src/'
        src: '**/*.js'
        dest: '<%= dirs.build %>/src/'

        options:
          banner: "<%= meta.banner %>"


    qunit:
      files: ['test/unit/**/*.html', '!**/disabled/**']

    uglify:
      options:
        globals:
          jQTouch: yes

      jqtouch:
        expand: yes
        cwd: '<%= dirs.dist %>/src/'
        src: '**/*.js'
        dest: "<%= dirs.dist %>/src/"
        ext: '.min.js'

      extensions:
        expand: yes
        cwd: "<%= dirs.dist %>/extensions/"
        src: '**/*.js'
        dest: "<%= dirs.dist %>/extensions/"
        rename: (dest, path) ->
          dest + path.replace /\.js$/, '.min.js'

      lib:
        expand: yes
        cwd: "<%= dirs.dist %>/lib/"
        src: '**/*.js'
        dest: "<%= dirs.dist %>/lib/"
        rename: (dest, path) ->
          dest + path.replace /\.js$/, '.min.js'

        options:
          preserveComments: (comment) ->
            
            # Preserve comments near the top of the file.
            # Loosey-goosey, I know, but I want to make sure we keep any
            # Zepto and jQuery lines about (c) and license
            if comment.start.line < 4
              yes
            else
              no
    
    mincss:
      themes:
        expand: yes
        cwd: "<%= dirs.dist %>/themes/css"
        src: '**/*.css'
        dest: "<%= dirs.dist %>/themes/css"
        ext: '.min.css'

    cover:
      compile:
        files:
          "<%= dirs.build %>/test/instrumented/jqtouch.js": ["src/jqtouch.js"]

    watch:
      theming:
        files: 'themes/scss/**/*.scss'
        tasks: ['compass']
      source:
        files: ['src/**/*.js']
        tasks: ['copy:source']
      coffee: 
        files: 'src/**/*.coffee'
        tasks: ['coffee']
      demos:
        files: ['{demos,extensions}/**/*.{html,js,css}']
        tasks: ['copy:prepare']
      extensions:
        files: ['extensions/**/*.coffee']
        tasks: ['coffee:extensions']

    livereload:
      options:
        base: 'build'
      files: ['build/**/*.{js,css,html}']

    jshint:
      src: "<%= dirs.src %>/**/*.js"
      options:
        camelcase: true
        curly: false
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noarg: true
        sub: true
        undef: true
        boss: true
        eqnull: true
        browser: true

        globals:
          $: true
          console: true
  
  grunt.renameTask 'watch', 'watch_files'

  grunt.registerTask 'watch', ['default', 'livereload', 'watch_files']

  # Git submodule updates
  grunt.registerTask 'zepto', ['rake', 'copy:zepto', 'copy:jquery-bridge']

  grunt.registerTask 'scripts', ['update_submodules', 'clean', 'coffee', 'copy:prepare', 'concat', 'zepto']

  # Default (Build)
  grunt.registerTask 'default', ['scripts', 'compass']

  # Test from scratch
  grunt.registerTask 'test', ['scripts', 'compass', 'copy:test', 'qunit']

  # Builds, then copies to versioned dist dir and minifies all JS
  grunt.registerTask 'dist', ['clean', 'default', 'copy:dist', 'uglify', 'mincss']
