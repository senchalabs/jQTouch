module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-coverjs"
  grunt.loadNpmTasks "grunt-contrib-qunit"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-css"

  grunt.registerMultiTask "compass", "Compile sass with compass", ->
    
    # roll our own, because I couldn't find -l options to the `contrib` version 
    cb = @async() # Tell grunt the task is async
    options = @data["options"] or {}
    params = grunt.template.process(@data["params"])
    exec = require("child_process").exec
    console.log "compass " + params + ""
    child = exec("compass " + params + "", options, (error, stdout, stderr) ->
      console.log "stdout: " + stdout  unless not stdout
      if error isnt null
        console.log "error: " + error
        console.log "stderr: " + stdout
      cb() # Execute the callback when the async task is done
    )

  grunt.registerMultiTask "rake", "Compile a Ruby Package with Rake", ->
    cb = @async() # Tell grunt the task is async
    options = @data["options"]
    params = grunt.template.process(@data["params"])
    exec = require("child_process").exec
    child = exec("rake " + params + "", options, (error, stdout, stderr) ->
      console.log "stdout: " + stdout  unless not stdout
      if error isnt null
        console.log "error: " + error
        console.log "stderr: " + stdout
      cb() # Execute the callback when the async task is done
    )

  grunt.registerMultiTask "gitmodule", "Update git submodules", ->
    cb = @async() # Tell grunt the task is async
    target = @target or ""
    path = @data["path"] or ("submodules/" + @target)
    exec = require("child_process").exec
    child = exec("git submodule update --init --recursive " + path, (error, stdout, stderr) ->
      console.log "stdout: " + stdout  unless not stdout
      if error isnt null
        console.log "error: " + error
        console.log "stderr: " + stdout
      cb() # Execute the callback when the async task is done
    )

  # Project configuration.
  grunt.initConfig
    pkg: "<json:package.json>"
    meta:
      version: "<%= pkg.version %>-<%= pkg.versionId %>"
      banner:
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
          */
        """
    dirs:
      src: "src"
      build: "build" # change back to `build` when you port away from ant`.
      dist: "jqtouch-<%= pkg.version %>-<%= pkg.versionId %>"

    clean:
      zepto: ["zepto/lib"]
      build: ["stage"]
      css: ["<%= dirs.build %>/css"]
      dist: ["<%= dirs.dist %>"]
      excluded: ["<%= dirs.dist %>/.gitignore", "<%= dirs.dist %>/*.sublime-project", "<%= dirs.dist %>/*.sublime-workspace", "<%= dirs.dist %>/**/.DS_Store"]

    copy:
      prepare:
        src: ["src/**", "lib/**", "themes/**", "extensions/**", "demos/**", "versions/**", "test/**", "*"]
        dest: "<%= dirs.build %>/"

        options:
          cwd: ""
          excludeEmpty: false

      dist:
        files:
          "<%= dirs.dist %>/": ["<%= dirs.build %>/**"]

        options:
          cwd: ""
          excludeEmpty: false

      zepto:
        files:
          "lib/zepto/": ["submodules/zepto/dist/**"]
          "<%= dirs.build %>/src/jqtouch-jquery.js": ["submodules/zepto/src/touch.js"]

        options:
          cwd: ""
          excludeEmpty: false

      "jquery-bridge":
        files:
          "<%= dirs.build %>/src/jqtouch-jquery.js": ["submodules/zepto/src/touch.js"]

        options:
          cwd: ""
          excludeEmpty: false

      checkin: # replace checkin version with updated css(es)
        files:
          "themes/css/": ["<%= dirs.dist %>/themes/css/**"]
          "src/jqtouch-jquery.js": ["<%= dirs.dist %>/src/jqtouch-jquery.js"]

        options:
          cwd: ""
          excludeEmpty: false

      htaccess:
        files:
          "<%= dirs.dist %>/.htaccess": ["<%= dirs.dist %>/sample.htaccess"]

        options:
          cwd: ""
          excludeEmpty: false

    replace:
      "jquery-bridge":
        src: ["<%= dirs.build %>/src/jqtouch-jquery.js"]
        overwrite: true
        replacements: [
          from: /e\.touches/g
          to: "(e.originalEvent || e).touches"
        ,
          from: /\(Zepto\)/g
          to: "(jQuery)"
        ]

      distpath:
        src: ["<%= dirs.dist %>/**/*.html"]
        overwrite: true
        replacements: [
          from: /([\w-\.]*)\.js/g
          to: "$1.min.js"
        ,
          from: /([\w-\.]*)\.min\.min\.js/g
          to: "$1.min.js"
        ]

      "strip-warnings":
        src: ["<%= dirs.dist %>/src/jqtouch.js", "<%= dirs.dist %>/src/jqtouch.min.js"]
        overwrite: true
        replacements: [
          from: /\n\s*warn\(.*/g
          to: ""
        ]

    gitmodule:
      zepto: {}
      recipes:
        path: "submodules/compass-recipes"

    rake:
      zepto:
        params: "concat[fx:ajax:data:detect:event:form:polyfill:touch] dist"
        options:
          cwd: "submodules/zepto"

    compass:
      all:
        params: "compile -l <%= dirs.build %>/themes/compass-recipes/ --sass-dir <%= dirs.build %>/themes/scss --css-dir <%= dirs.build %>/themes/css --output-style compressed --environment production -q"

    lint:
      files: ["src/jqtouch.js"]

    qunit:
      files: ["<%= dirs.build %>/test/unit/*.html"]

    concat:
      dist:
        src: ["<banner>", "<file_strip_banner:src/jqtouch.js>"]
        dest: "<%= dirs.dist %>/src/jqtouch.js"

    minjs:
      extensions:
        src: ["<%= dirs.dist %>/extensions/*.js"]
        dest: "<%= dirs.dist %>/extensions/*.min.js"
        options:
          banner: true

    min:
      jqtouch:
        src: ["<%= dirs.dist %>/src/jqtouch.js"]
        dest: "<%= dirs.dist %>/src/jqtouch.min.js"

      "jquery-bridge":
        src: ["<%= dirs.dist %>/src/jqtouch-jquery.js"]
        dest: "<%= dirs.dist %>/src/jqtouch-jquery.min.js"

      "jquery-bridge2":
        src: ["<%= dirs.dist %>/src/jqtouch-jquery2.js"]
        dest: "<%= dirs.dist %>/src/jqtouch-jquery2.min.js"

    cover:
      compile:
        files:
          "<%= dirs.build %>/test/instrumented/jqtouch.js": ["src/jqtouch.js"]

    watch:
      files: "<%= dirs.build %>/themes/css"
      tasks: "compass"

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

    uglify: {}
  
  # Tasks
  grunt.registerTask "nuke", ["clean:build", "clean:dist"]
  
  # Git submodule updates
  grunt.registerTask "css", ["clean:css", "gitmodule:recipes", "compass"]
  grunt.registerTask "zepto", ["clean:zepto", "gitmodule:zepto", "rake:zepto", "copy:zepto"]
  grunt.registerTask "jquery-bridge", ["zepto", "gitmodule:zepto", "copy:jquery-bridge", "replace:jquery-bridge"]
  
  # Tests & checks
  grunt.registerTask "test", ["copy:prepare", "qunit"]
  grunt.registerTask "cq", ["jshint", "light", "jshint"]

  # Full-build tasks
  grunt.registerTask "light", ["nuke", "copy:prepare", "css", "concat"]
  grunt.registerTask "dist", ["nuke", "zepto", "jquery-bridge", "light", "test", "copy:dist", "replace:strip-warnings", "min", "minjs", "replace:distpath", "copy:htaccess", "clean:excluded", "copy:checkin"]
  grunt.registerTask "full", ["nuke", "light", "cq", "dist"]