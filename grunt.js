/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-coverjs');

  grunt.registerTask('intro', 'Introduction to build', function() {
    grunt.log.write('We are going to build a jQTouch release!');
  });

  grunt.registerMultiTask('compass', '', function() { 
    /* roll our own, because I couldn't find -l options to the `contrib` version */
    
    var cb = this.async(); // Tell grunt the task is async
    var options = this.data['options'] || {};
    var params = grunt.template.process(this.data['params']);

    var exec = require('child_process').exec;
    console.log('compass ' + params + '');
    var child = exec('compass ' + params + '', options, function(error, stdout, stderr) {
      if (!!stdout) {
        console.log('stdout: ' + stdout);
      }
      if (error !== null) {
        console.log('error: ' + error);
        console.log('stderr: ' + stdout);
      }
      cb(); // Execute the callback when the async task is done
    });
  });

  grunt.registerMultiTask('rake', 'Compile a Ruby Package with Rake', function() {
    var cb = this.async(); // Tell grunt the task is async

    var options = this.data['options'];
    var params = grunt.template.process(this.data['params']);

    var exec = require('child_process').exec;
    var child = exec('rake ' + params + '', options, function(error, stdout, stderr) {
      if (!!stdout) {
        console.log('stdout: ' + stdout);
      }
      if (error !== null) {
        console.log('error: ' + error);
        console.log('stderr: ' + stdout);
      }
      cb(); // Execute the callback when the async task is done
    });     
  });

  grunt.registerMultiTask('gitmodule', 'Update git submodules', function() {
    var cb = this.async(); // Tell grunt the task is async

    var target = this.target || '';
    var path = this.data['path'] || ('submodules/' + this.target);

    var exec = require('child_process').exec;
    var child = exec('git submodule update --init --recursive ' + path, 
      function(error, stdout, stderr) {
        if (!!stdout) {
          console.log('stdout: ' + stdout);
        }
        if (error !== null) {
          console.log('error: ' + error);
          console.log('stderr: ' + stdout);
        }
        cb(); // Execute the callback when the async task is done
      }
    );
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
        clean: {
          zepto: ['zepto/lib'],
          dist: ['<%= dirs.dest %>']
        },
        copy: {
          prepare: {
            files: {
              '<%= dirs.dest %>/': ['dist/**', 'src/**', 'lib/**', 'themes/**',
                  'extensions/**', 'demos/**', 'versions/**', '*']
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          },
          zepto: {
            files: {
              'lib/zepto/': ['submodules/zepto/dist/**'],
              'lib/zepto/touch.js': ['submodules/zepto/src/touch.js'],
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          },
          checkin: { /* replace checkin version to updated css */
            files: {
              'themes/css/': ['<%= dirs.dest %>/themes/css/**']
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          }
        },
        gitmodule: {
          zepto: {
          },
          recipes: {
            path: 'submodules/compass-recipes'
          }
        },
        rake: {
          zepto: {
            params: 'concat[fx:ajax:data:detect:event:form:polyfill:touch] dist',
            options: {
              cwd: 'submodules/zepto'
            }
          }
        },
        compass: {
          all: {
            params: 'compile -l <%= dirs.dest %>/themes/compass-recipes/ --sass-dir <%= dirs.dest %>/themes/scss --css-dir <%= dirs.dest %>/themes/css --output-style compressed --environment production -q'
          }
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
          jqtouch: {
            src: ['<%= dirs.dest %>/src/jqtouch.js'],
            dest: '<%= dirs.dest %>/src/jqtouch.min.js'
          },
          'jquery-bridge': {
            src: ['<%= dirs.dest %>/src/jqtouch-jquery.js'],
            dest: '<%= dirs.dest %>/src/jqtouch-jquery.min.js'
          },
          'jquery-bridge2': {
            src: ['<%= dirs.dest %>/src/jqtouch-jquery2.js'],
            dest: '<%= dirs.dest %>/src/jqtouch-jquery2.min.js'
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
  grunt.registerTask('zepto', 'clean:zepto rake:zepto copy:zepto');

  grunt.registerTask('css', 'clean:dist copy:prepare gitmodule:recipes compass');

  grunt.registerTask('light', 'intro copy:prepare css concat min');

  grunt.registerTask('default', 'intro qunit cover light');

  grunt.registerTask('full', 'intro lint zepto default copy:checkin');

};
