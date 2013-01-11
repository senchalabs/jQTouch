/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-compass');

  grunt.loadNpmTasks('grunt-coverjs');

  // Create a new task.
  grunt.registerTask('intro', 'Introduction to build', function() {
    grunt.log.write('We are going to build a jQTouch release!');
  });

  // Project configuration.
  grunt.initConfig({
	pkg: '<json:package.json>',
    meta: {
      version: '<%= pkg.version %>',
      banner: '/*\n' +
        '          _/    _/_/    _/_/_/_/_/                              _/                		\n' +
        '             _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/ 					\n' +
        '        _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/					\n' +
        '       _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/ 					\n' +
        '      _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/  					\n' +
        '     _/																 				\n' +
        '  _/																	 				\n' +
        '  Created by David Kaneda <http://www.davidkaneda.com>				 					\n' +
        '  Maintained by Thomas Yip <http://beedesk.com/>						 				\n' +
        '  Sponsored by Sencha Labs <http://www.sencha.com/>					 				\n' +
        '  Special thanks to Jonathan Stark <http://www.jonathanstark.com/>    					\n' +
        '																		 				\n' +
        '  Documentation and issue tracking on GitHub <http://github.com/senchalabs/jQTouch/>	\n' +
        '																						\n' + 
        '  (c) 2009-<%= grunt.template.today("yyyy") %> Sencha Labs								\n' +
        '																						\n' + 
        '  Version: <%= meta.version %> - <%= grunt.template.today("yyyy-mm-dd") %>				\n' +
        '																						\n' + 
        '  jQTouch may be freely distributed under the MIT license.								\n' +
        '*/'
    },
    dirs: {
        src: 'src',
        dest: 'jqtouch-<%= pkg.version %>'
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
      files: '<config:lint.files>',
      tasks: 'lint qunit'
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

  // Default task.
  grunt.registerTask('default', 'cover qunit concat min');

};
