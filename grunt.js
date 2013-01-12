/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-coverjs');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('intro', 'Introduction to build', function() {
    grunt.log.write('We are going to build a jQTouch release!');
  });

  grunt.registerTask('compass', 'Simple Compass', function() {
    var compass = grunt.config.get('compass');
    var params = grunt.template.process(compass['params']);
    var outoptions = compass['stdout'];
    console.warn('compass: ' + params);

    // Tell grunt the task is async
    var cb = this.async();
    
    var exec = require("child_process").exec;
    var child = exec('compass ' + params + '', function(error, stdout, stderr) {
      if (outoptions !== false && !!stdout) {
        console.log('stdout: ' + stdout);
      }
      if (error !== null) {
        console.log('error: ' + error);
        console.log('stderr: ' + stdout);
      }
      // Execute the callback when the async task is done
      cb();
    });
  });

  grunt.registerTask('clean', 'Simple Delete Folders', function() {
    var clean = grunt.config.get('clean');
    var files = grunt.template.process(clean['files']);
    console.warn('clean files: ' + files);

    // Tell grunt the task is async
    var cb = this.async();
    
    var exec = require("child_process").exec;
    var child = exec('rm -r -f ' + files + '', function(error, stdout, stderr) {
      if (!!stdout) {
        console.log('stdout: ' + stdout);
      }
      if (!!error) {
        console.log('error: ' + error);
        console.log('stderr: ' + stdout);
      }
      // Execute the callback when the async task is done
      cb();
    });
  });

  // Project configuration.
  grunt
      .initConfig({
        pkg: '<json:package.json>',
        meta: {
          version: '<%= pkg.version %>-<%= pkg.version %>',
          banner: '/*\n'
              + '          _/    _/_/    _/_/_/_/_/                              _/                		\n'
              + '             _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/ 					\n'
              + '        _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/					\n'
              + '       _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/ 					\n'
              + '      _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/  					\n'
              + '     _/																 				\n'
              + '  _/																	 				\n'
              + '  Created by David Kaneda <http://www.davidkaneda.com>				 					\n'
              + '  Maintained by Thomas Yip <http://beedesk.com/>						 				\n'
              + '  Sponsored by Sencha Labs <http://www.sencha.com/>					 				\n'
              + '  Special thanks to Jonathan Stark <http://www.jonathanstark.com/>    					\n'
              + '																		 				\n'
              + '  Documentation and issue tracking on GitHub <http://github.com/senchalabs/jQTouch/>	\n'
              + '																						\n'
              + '  (c) 2009-<%= grunt.template.today("yyyy") %> Sencha Labs								\n'
              + '																						\n'
              + '  Version: <%= meta.version %> - <%= grunt.template.today("yyyy-mm-dd") %>				\n'
              + '																						\n'
              + '  jQTouch may be freely distributed under the MIT license.								\n'
              + '*/'
        },
        dirs: {
          src: 'src',
          dest: 'jqtouch-<%= pkg.version %>-<%= pkg.versionId %>'
        },
        copy: {
          target: {
            options: {
              cwd: 'path/to/sources',
              excludeEmpty: false,

            },
            files: {
              '<%= dirs.dest %>/': ['dist/**', 'src/**', 'lib/**', 'themes/**',
                  'extensions/**', 'demos/**', 'versions/**', '*']
            }
          }
        },
        clean: {
          files: '<%= dirs.dest %>'
        },
        compass: {
          params: 'compile -l <%= dirs.dest %>/themes/compass-recipes/ --sass-dir <%= dirs.dest %>/themes/scss --css-dir <%= dirs.dest %>/themes/css --output-style compressed --environment production -q',
          stdout: true
        },
        lint: {
          files: ['src/jqtouch.js']
        },
        qunit: {
          files: ['test/unit/*.html']
        },
        concat: {
          dist: {
            src: ['<banner>', '<file_strip_banner:src/jqtouch.js>'],
            dest: '<%= dirs.dest %>/src/jqtouch.js'
          }
        },
        min: {
          dist: {
            src: ['<%= dirs.dest %>/src/jqtouch.js'],
            dest: '<%= dirs.dest %>/src/jqtouch.min.js'
          }
        },
        cover: {
          compile: {
            files: {
              'test/instrumented/jqtouch.js': ['src/jqtouch.js']
            }
          }
        },
        watch: {
          files: '<%= dirs.dest %>/themes/css',
          tasks: 'compass'
        },
        jshint: {
          options: {
            curly: true,
            eqeqeq: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            boss: true,
            eqnull: true,
            browser: true
          },
          globals: {
            jQuery: true
          }
        },
        uglify: {}
      });

  // Tasks
  grunt.registerTask('light', 'intro clean copy compass concat min');

  grunt.registerTask('default', 'intro qunit cover light');

  grunt.registerTask('full', 'intro lint default');

};
