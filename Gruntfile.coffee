module.exports = (grunt) ->
  extend = require('util')._extend

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    meta:
      version: "<%= pkg.version %>-<%= pkg.versionId %>"
      tag: "v<%= pkg.version %><%= pkg.versionId %>"
      build: "jqt-<%= meta.tag %>"
      dist: "<%= meta.build %>"
      demo: "jqt-demo-<%= meta.tag %>"
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
      etc: "etc"
      build: "build"
      dist: "dist"
      archive: "archive"
      package: "<%= dirs.archive %>/package"
      css: "<%= dirs.build %>/themes/css"

    clean:
      build: ["<%= dirs.build %>"]
      dist: ["<%= dirs.dist %>"]
      package: ["<%= dirs.package%>"]
      zepto: ["submodules/zepto/dist"]

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
        src: ["*/**", "!{src/reference,test,node_modules,build,dist,archive,submodules,etc,jqtouch*,themes/compass-recipes,themes/scss}/**", "!*.{md,txt,htaccess}", "!.*"]
        dest: "<%= dirs.build %>/"

      source:
        expand: yes
        cwd: 'src'
        src: ["**/*.js"]
        dest: "<%= dirs.build %>/src/"

      dist:
        files: [
          expand: yes
          src: ["{src,extensions,themes}/**","lib/zepto/**"]
          dest: '<%= dirs.dist %>'
          cwd: '<%= dirs.package %>'
        ,
          src: "<%= dirs.package %>/fingerprint"
          dest: "<%= dirs.dist %>/fingerprint"
          cwd: ''
        ]

      package:
        files: [
          expand: yes
          src: ["*/**"]
          dest: '<%= dirs.package %>'
          cwd: '<%= dirs.build %>'
        ,
          expand: yes
          src: ["README.md","VERSIONS.md","LICENSE.txt","package.json"]
          dest: '<%= dirs.package %>'
          cwd: ''
        ,
          src: "<%= dirs.etc %>/sample.htaccess"
          dest: "<%= dirs.package %>/.htaccess"
          cwd: ''
        ,
          src: "<%= dirs.etc %>/fingerprint"
          dest: "<%= dirs.package %>/fingerprint"
          cwd: ''
        ]

        options:
          processContentExclude: ['**/*.{png,gif,jpg,ico,psd}']
          processContent: (content, path) ->
            # Strip warnings from JavaScript
            if path.match /\.js$/
              content.replace /\n\s*warn\(.*/g, ''

            # Update to minified JS/CSS paths in HTML
            else if path.match /\.html$/
              content
                .replace(/([\w-\.]*)(\.min)?\.js/g, '$1.min.js')
                .replace(/(themes\/css\/[\w-\.]*)(\.min)?\.css/g, '$1.min.css')

            else if path.match /\/fingerprint$/
              content
                .replace(/\{build_id\}/, grunt.config('meta.build'))
                .replace(/\{build_git_revision\}/, grunt.config('meta.revision'))
                .replace(/\{build_date\}/, grunt.template.today('yyyy-mm-dd hh:mmZ'))

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
          src: ['zepto.js', 'zepto.min.js']
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

    compress:
      archive:
        options:
          archive: "<%= dirs.archive %>/<%= meta.demo %>.tgz"
        files: [
          src: ["package/**/*"]
          dest: ""
          cwd: '<%= dirs.archive %>'
          expand: true
        ]
      dist:
        options:
          archive: "<%= dirs.archive %>/<%= meta.dist %>.tgz"
        files: [
          src: ["dist/**/*","README.md","LICENSE.txt","VERSIONS.md","package.json"]
          dest: "package"
          cwd: ''
          expand: true
        ]

    "npm-command":
      zepto:
        command: "run-script"
        script: "dist"
        params: ""
        options:
          cwd: "submodules/zepto"
          env: extend(process.env, {'MODULES': 'zepto event ajax form ie detect fx data touch'})

    compass:
      compile:
        files: [
          src: 'themes/scss/**/*.scss'
        ]
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
      options:
        timeout: 15000

    uglify:
      options:
        globals:
          jQTouch: yes

      jqtouch:
        expand: yes
        cwd: '<%= dirs.package %>/src/'
        src: '**/*.js'
        dest: "<%= dirs.package %>/src/"
        ext: '.min.js'

      extensions:
        expand: yes
        cwd: "<%= dirs.package %>/extensions/"
        src: '**/*.js'
        dest: "<%= dirs.package %>/extensions/"
        rename: (dest, path) ->
          dest + path.replace /\.js$/, '.min.js'

      lib:
        expand: yes
        cwd: "<%= dirs.package %>/lib/"
        src: '**/*.js'
        dest: "<%= dirs.package %>/lib/"
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

    cssmin:
      themes:
        expand: yes
        cwd: "<%= dirs.build %>/themes/css"
        src: '**/*.css'
        dest: "<%= dirs.package %>/themes/css"
        ext: '.min.css'

    cover:
      compile:
        files:
          "<%= dirs.build %>/test/instrumented/jqtouch.js": ["src/jqtouch.js"]

    watch_files:
      build:
        files: ['build/**', '!.*', '!.**/*']
        options:
          livereload: true  # default port: 35729
      theming:
        files: 'themes/scss/**/*.scss'
        tasks: ['compass']
      coffee:
        files: 'src/**/*.coffee'
        tasks: ['coffee']
      source:
        files: ['src/**/*.js']
        tasks: ['copy:source']
      demos:
        files: ['{demos,extensions}/**/*.{html,js,css}']
        tasks: ['copy:prepare']
      extensions:
        files: ['extensions/**/*.{coffee}']
        tasks: ['coffee:extensions']

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

  # Task definitions
  grunt.loadNpmTasks "grunt-coverjs"
  grunt.loadNpmTasks "grunt-contrib-qunit"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-compass"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-cssmin"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-compress"
  grunt.loadNpmTasks "grunt-update-submodules"

  grunt.registerMultiTask "npm-command", "Run an NPM command in a specific module", ->
    cb = @async() # Tell grunt the task is async
    command = @data["command"]
    params = grunt.template.process(@data["params"])
    script = grunt.template.process(@data["script"])
    options = @data["options"]

    exec = require("child_process").exec
    child = exec("npm install", options, (error, stdout, stderr) ->
      grunt.log.write stdout if stdout
      grunt.log.error stdout if stderr
      if error isnt null
        cb(error) # Execute the callback when the async task is done
      else
        child = exec(["npm", command, script, params].join(' '), options, (error, stdout, stderr) ->
          grunt.log.write stdout if stdout
          grunt.log.error stdout if stderr
          cb(error) # Execute the callback when the async task is done
        )
    )

  grunt.registerTask "git-describe", "Describes current git commit", ->
    # prefer to use our own task for better control over cmd line args
    done = this.async();
    args = ["describe", "--tags", "--always", "--long", "--dirty=*", "--abbrev=12"]
    grunt.util.spawn cmd: "git", args: args, (err, result) ->
      if err
        grunt.log.error err
        return done(false)
      grunt.config("meta.revision", result)
      grunt.config("meta.dist", 'jqt-' + result)
      grunt.config("meta.demo", 'jqt-demo-' + result)
      return done(result)

  grunt.registerTask "git-tag", "Tag the current git commit", ->
    done = this.async();
    args = ["tag", grunt.config("meta.tag")]
    console.log('$ git ' + args.join(' '))
    grunt.util.spawn cmd: "git", args: args, (err, result) ->
      if err
        grunt.log.error err
        return done(false)
      return done(result)

  grunt.renameTask 'watch', 'watch_files'

  # Git submodule updates
  grunt.registerTask 'zepto', ['clean:zepto', 'npm-command:zepto', 'copy:zepto', 'copy:jquery-bridge']

  # Compile Scripts
  grunt.registerTask 'scripts', ['coffee', 'copy:prepare', 'concat', 'zepto']

  # Minify Assets
  grunt.registerTask 'minify', ['uglify', 'cssmin']

  # Build
  grunt.registerTask 'build', ['zepto', 'scripts', 'compass']

  # Watch
  grunt.registerTask 'watch', ['build', 'watch_files']

  # Default (Same as full)
  grunt.registerTask 'default', ['full']

  # Full (Clean and Build)
  grunt.registerTask 'full', ['clean', 'update_submodules', 'build']

  # Test
  grunt.registerTask 'test', ['build', 'copy:test', 'qunit']

  # Build full, and and minifies all artifacts
  grunt.registerTask 'pack', ['full', 'git-describe', 'copy:package', 'minify']

  # Pack and compress into a versioned archive
  grunt.registerTask 'archive', ['pack', 'compress:archive']

  # Select the core from package to make a `dist` structure
  grunt.registerTask 'dist', ['test', 'archive', 'copy:dist', 'compress:dist']

  # Npm Prepublish
  grunt.registerTask 'release', ['git-tag', 'dist']
