/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-coverjs');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('intro', 'Introduction to build', function() {
    grunt.log.write('We are going to build a jQTouch release!');
  });

  grunt.registerMultiTask('compass', 'Compile sass with compass', function() { 
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

  grunt.registerMultiTask('minjs', 'Minify all JS in a directory', function() {
    var target = this.target || '';
    var options = this.data['options'];

    var src = this.data['src'] || '*.js';
    var dest = this.data['src'] || '*.min.js';

    var banner = '';
    if (options && options['banner']) {
      banner = grunt.template.process(grunt.config.get('meta')['banner']);      
    }
    grunt.file.expand({cwd: ''}, src).forEach(function(relpath) {
      if (!/min.js$/g.test(relpath)) {
        var dest = relpath.replace(/([\w-\.]*)\.js/g, '$1.min.js');
        console.log('expanded: ' + relpath + ' dest: ' + dest);

        var max = grunt.file.read(relpath);

        var min = banner + grunt.helper('uglify', max, grunt.config('uglify'));
        grunt.file.write(dest, min);
      }
    });
  });

  // Project configuration.
  grunt
      .initConfig({
        pkg: '<json:package.json>',
        meta: {
          version: '<%= pkg.version %>-<%= pkg.versionId %>',
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
              + '*/\n'
        },
        dirs: {
          src: 'src',
          build: 'stage', /* change back to `build` when you port away from ant`. */
          dist: 'jqtouch-<%= pkg.version %>-<%= pkg.versionId %>'
        },
        clean: {
          zepto: ['zepto/lib'],
          build: ['<%= dirs.build %>'],
          css: ['<%= dirs.build %>/css'],
          dist: ['<%= dirs.dist %>'],
          excluded: [
            '<%= dirs.dist %>/.gitignore',
            '<%= dirs.dist %>/*.sublime-project',
            '<%= dirs.dist %>/*.sublime-workspace',
            '<%= dirs.dist %>/**/.DS_Store'
          ]
        },
        copy: {
          prepare: {
            files: {
              '<%= dirs.build %>/': ['src/**', 'lib/**', 'themes/**',
                  'extensions/**', 'demos/**', 'versions/**', 'test/**', '*']
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          },
          dist: {
            files: {
              '<%= dirs.dist %>/': ['<%= dirs.build %>/**']
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          },
          zepto: {
            files: {
              'lib/zepto/': ['submodules/zepto/dist/**'],
              '<%= dirs.build %>/src/jqtouch-jquery.js': ['submodules/zepto/src/touch.js'],
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          },
          'jquery-bridge': {
            files: {
              '<%= dirs.build %>/src/jqtouch-jquery.js': ['submodules/zepto/src/touch.js']
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          },
          checkin: { /* replace checkin version with updated css(es) */
            files: {
              'themes/css/': ['<%= dirs.dist %>/themes/css/**'],
              'src/jqtouch-jquery.js': ['<%= dirs.dist %>/src/jqtouch-jquery.js']
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          },
          htaccess: {
            files: {
              '<%= dirs.dist %>/.htaccess': ['<%= dirs.dist %>/sample.htaccess']
            },
            options: {
              cwd: '',
              excludeEmpty: false,

            }
          }
        },
        replace: {
          'jquery-bridge': {
            src: ['<%= dirs.build %>/src/jqtouch-jquery.js'],
            overwrite: true,
            replacements: [{ 
              from: /e\.touches/g,
              to: '(e.originalEvent || e).touches'
            },{ 
              from: /\(Zepto\)/g,
              to: '(jQuery)'
            }]
          },
          distpath: {
            src: ['<%= dirs.dist %>/**/*.html'],
            overwrite: true,
            replacements: [{ 
              from: /([\w-\.]*)\.js/g,
              to: '$1.min.js'
            }, { 
              from: /([\w-\.]*)\.min\.min\.js/g,
              to: '$1.min.js'
            }]
          },
          'strip-warnings': {
            src: ['<%= dirs.dist %>/src/jqtouch.js', '<%= dirs.dist %>/src/jqtouch.min.js'],
            overwrite: true,
            replacements: [{ 
              from: /\n\s*warn\(.*/g,
              to: ''
            }]
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
            params: 'compile -l <%= dirs.build %>/themes/compass-recipes/ --sass-dir <%= dirs.build %>/themes/scss --css-dir <%= dirs.build %>/themes/css --output-style compressed --environment production -q'
          }
        },
        lint: {
          files: ['src/jqtouch.js']
        },
        qunit: {
          files: ['<%= dirs.build %>/test/unit/*.html']
        },
        concat: {
          dist: {
            src: ['<banner>', '<file_strip_banner:src/jqtouch.js>'],
            dest: '<%= dirs.dist %>/src/jqtouch.js'
          }
        },
        minjs: {
          extensions: {
            src: ['<%= dirs.dist %>/extensions/*.js'],
            dest: '<%= dirs.dist %>/extensions/*.min.js',
            options: {
              banner: true
            }
          }
        },
        min: {
          jqtouch: {
            src: ['<%= dirs.dist %>/src/jqtouch.js'],
            dest: '<%= dirs.dist %>/src/jqtouch.min.js'
          },
          'jquery-bridge': {
            src: ['<%= dirs.dist %>/src/jqtouch-jquery.js'],
            dest: '<%= dirs.dist %>/src/jqtouch-jquery.min.js'
          },
          'jquery-bridge2': {
            src: ['<%= dirs.dist %>/src/jqtouch-jquery2.js'],
            dest: '<%= dirs.dist %>/src/jqtouch-jquery2.min.js'
          }
        },
        cover: {
          compile: {
            files: {
              '<%= dirs.build %>/test/instrumented/jqtouch.js': ['src/jqtouch.js']
            }
          }
        },
        watch: {
          files: '<%= dirs.build %>/themes/css',
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
  grunt.registerTask('nuke', 'clean:build clean:dist');

  grunt.registerTask('css', 'clean:css gitmodule:recipes compass');

  grunt.registerTask('zepto', 'clean:zepto gitmodule:zepto rake:zepto copy:zepto');

  grunt.registerTask('jquery-bridge', 'zepto gitmodule:zepto copy:jquery-bridge replace:jquery-bridge');

  grunt.registerTask('test', 'copy:prepare qunit');

  grunt.registerTask('cq', 'lint light jshint csslint cover');

  grunt.registerTask('light', 'intro nuke copy:prepare css concat');

  grunt.registerTask('dist', 'intro nuke zepto jquery-bridge light test copy:dist replace:strip-warnings min minjs replace:distpath copy:htaccess clean:excluded copy:checkin');

  grunt.registerTask('full', 'intro nuke light cq dist');

};
