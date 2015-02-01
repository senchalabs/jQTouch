module.exports = (grunt) ->
  extend  = require('util')._extend
  path    = require('path')

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
      script:
        expand: yes
        cwd: 'src'
        src: ['**.coffee']
        dest: '<%= dirs.build %>/src/'
        ext: '.js'

      extension:
        expand: yes
        cwd: 'extensions'
        src: ['**.coffee']
        dest: '<%= dirs.build %>/extensions/'
        rename: (dest, filepath) ->
          path.join dest, filepath.replace /\.coffee$/, '.js'

      demo:
        expand: yes
        cwd: 'demos'
        src: ['**/*.coffee']
        dest: '<%= dirs.build %>/demos/'
        rename: (dest, filepath) ->
          path.join dest, filepath.replace /\.coffee$/, '.js'

    copy:
      lib:
        expand: yes
        cwd: 'lib'
        src: ["**/*", "!.*"]
        dest: "<%= dirs.build %>/lib/"

      script:
        expand: yes
        cwd: 'src'
        src: ["**/*.js", "!reference/**"]
        dest: "<%= dirs.build %>/src/"

      demo:
        expand: true
        cwd: 'demos'
        src: ["**/*", "!.*"]
        dest: "<%= dirs.build %>/demos"

      extension:
        expand: true
        cwd: 'extensions'
        src: ["**/*", "!.*", "!*.coffee"]
        dest: "<%= dirs.build %>/extensions"

      theme:
        expand: true
        cwd: 'themes'
        src: ["img/**/*", "!.*"]
        dest: "<%= dirs.build %>/themes"

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
          src: ["**/*"]
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
          src: ["dist/**/*"]
          dest: "package"
          cwd: ''
          expand: true
        ,
          src: ["README.md","LICENSE.txt","VERSIONS.md","package.json"]
          dest: "package/dist"
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
      theme:
        files: [
          src: 'themes/scss/**/*.scss'
        ]
        options:
          load: 'submodules/compass-recipes/'
          sassDir: 'themes/scss'
          cssDir: '<%= dirs.css %>'

      demo:
        files: [
          src: 'demos/**/*.scss'
        ]
        options:
          load: 'submodules/compass-recipes/'
          sassDir: 'demos/'
          cssDir: "<%= dirs.build %>/demos/"

      extension:
        files: [
          src: 'extensions/**/*.scss'
        ]
        options:
          load: 'submodules/compass-recipes/'
          sassDir: 'extensions/'
          cssDir: "<%= dirs.build %>/extensions/"

    # Concat is only used to add our banner
    concat:
      script:
        expand: yes
        cwd: '<%= dirs.build %>/src/'
        src: ['**/*.js', '!**/jqtouch-jquery.js']
        dest: '<%= dirs.build %>/src/'
        options:
          banner: "<%= meta.banner %>"

      theme:
        expand: yes
        cwd: '<%= dirs.build %>/themes/'
        src: '**/*.css'
        dest: '<%= dirs.build %>/themes/'
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
        src: ['**/*.js', '!**/jqtouch-jquery.js', '!**/*.min.js']
        dest: '<%= dirs.package %>/src/'
        ext: '.min.js'
        options:
          banner: '<%= meta.banner %>'

      lib:
        expand: yes
        cwd: '<%= dirs.package %>'
        src: ['lib/**/*.js', 'src/jqtouch-jquery.js', '!**/*.min.js']
        dest: '<%= dirs.package %>'
        rename: (dest, filepath) ->
          path.join dest, filepath.replace /\.js$/, '.min.js'

        options:
          preserveComments: (comment) ->
            # Preserve comments near the top of the file.
            # Loosey-goosey, I know, but I want to make sure we keep any
            # Zepto and jQuery lines about (c) and license
            if comment.start.line < 6
              yes
            else
              no

      extension:
        expand: yes
        cwd: "<%= dirs.package %>/extensions/"
        src: '**/*.js'
        dest: "<%= dirs.package %>/extensions/"
        rename: (dest, filepath) ->
          path.join dest, filepath.replace /\.js$/, '.min.js'
        options:
          banner: "<%= meta.banner %>"

    cssmin:
      theme:
        expand: yes
        cwd: "<%= dirs.package %>/themes/css"
        src: ['**/*.css', '!**/*.min.css']
        dest: "<%= dirs.package %>/themes/css"
        ext: '.min.css'
        options:
          banner: "<%= meta.banner %>"

      extension:
        expand: yes
        cwd: "<%= dirs.package %>/extensions"
        src: ['**/*.css', '!**/*.min.css']
        dest: "<%= dirs.package %>/extensions"
        rename: (dest, filepath) ->
          path.join dest, filepath.replace /\.css$/, '.min.css'
        options:
          banner: "<%= meta.banner %>"

    cover:
      compile:
        files:
          "<%= dirs.build %>/test/instrumented/jqtouch.js": ["src/jqtouch.js"]

    watch_files:
      live:
        files: ['build/**', '!.*', '!.**/*']
        options:
          livereload: true  # default port: 35729, add <script src="http://localhost:35729/livereload.js"></script>
      theme:
        files: ['themes/scss/**/*.scss', '!.*', '!.**/*']
        tasks: ['compass']
        dot: false
      coffee:
        files: ['src/**/*.coffee', '!.*', '!.**/*']
        tasks: ['coffee:script']
        dot: false
      script:
        files: ['src/**/*.js', '!.*', '!.**/*']
        tasks: ['copy:script']
        dot: false
      demo:
        files: ['demos/**/*', '!.*', '!.**/*']
        tasks: ['demo']
        dot: false
      extension:
        files: ['extensions/**/*', '!.*', '!.**/*']
        tasks: ['extension']
        dot: false

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
  require('load-grunt-tasks')(grunt);

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

  # Build Zepto
  grunt.registerTask 'zepto', ['npm-command:zepto', 'copy:zepto', 'copy:jquery-bridge']

  # Build Lib
  grunt.registerTask 'lib', ['zepto', 'copy:lib']

  # Build Scripts
  grunt.registerTask 'script', ['copy:script', 'coffee:script', 'concat:script']

  # jQT Theme
  grunt.registerTask 'theme', ['script', 'copy:theme', 'compass:theme', 'concat:theme']

  # Main jQT bits
  grunt.registerTask 'main', ['script', 'theme']

  # Build Extensions
  grunt.registerTask 'extension', ['copy:extension', 'coffee:extension', 'compass:extension']

  # Build Demos
  grunt.registerTask 'demo', ['copy:demo', 'coffee:demo', 'compass:demo']

  # Build
  grunt.registerTask 'build', ['lib', 'main', 'extension', 'demo']

  # Watch
  grunt.registerTask 'watch', ['build', 'watch_files']

  # Full (Clean and Build)
  grunt.registerTask 'full', ['clean', 'update_submodules', 'build']

  # Default (Same as full)
  grunt.registerTask 'default', ['full']

  # Test
  grunt.registerTask 'test', ['copy:test', 'qunit']

  # Minify Assets
  grunt.registerTask 'minify', ['uglify', 'cssmin']

  # Build full, and and minifies all artifacts
  grunt.registerTask 'pack', ['git-describe', 'copy:package', 'minify']

  # Pack and compress into a versioned archive
  grunt.registerTask 'archive', ['pack', 'compress:archive']

  # Select the core from package to make a `dist` structure
  grunt.registerTask 'dist', ['full', 'test', 'archive', 'copy:dist', 'compress:dist']

  # Npm Prepublish
  grunt.registerTask 'release', ['git-tag', 'dist']
