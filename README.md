# jQT

## Create powerful mobile apps with just HTML, CSS, and Zepto.js (or jQuery).

[![Build Status](https://api.travis-ci.org/senchalabs/jQTouch.png?branch=master)](http://travis-ci.org/senchalabs/jQTouch)

jQTouch is a JavaScript plugin which works with either Zepto.js or jQuery, and comes with smooth animations, navigation, and themes for mobile WebKit browsers (as found in iOS, Android, BlackBerry, and WebOS).

- [Easy to install](https://github.com/senchalabs/jQTouch/wiki/Getting-Started). Get up and running in a few minutes.
- [Entirely customizable](https://github.com/senchalabs/jQTouch/wiki/Initialization-Options) with selector options
- [Theme support](https://github.com/senchalabs/jQTouch/wiki/Theming), including default Apple and jQTouch custom themes
- [Callback functions](https://github.com/senchalabs/jQTouch/wiki/Callback-Events) throughout, including swipe and orientation change detection
- [Zepto](https://github.com/madrobby/zepto) integration - Use Zepto.js instead of jQuery to cut down on precious bandwidth. Zepto.js features a similar API to jQuery, but optimized for WebKit and much smaller.
- Sass-based stylesheets, easily modified with variables and optimized for size.
- Image-less stylesheets -- Using [Compass Recipes](https://github.com/senchalabs/compass-recipes), we have recreated all of the gradients and background patterns with CSS. This way, they are resolution independent, dynamically theme-able, and lower bandwidth.
- Page history management and CSS3 page transitions, including 3D flip, cube, and swap
- Failover to 2D animations for devices that don't support 3D
- Easily allow apps to run in fullscreen mode with custom icons and startup screens
- The power of jQuery to build AJAX applications
- New demos: Clock and Todo

## Getting Started

The easiest way to try out jQT is with the demo archive, which can be found in the release tab on Github:

- [jQT Releases](https://github.com/senchalabs/jQTouch/releases)

Please look for the download (green button) with filename prefixed with `jqt-demo` (ie, `jqt-demo-<< version >>.tar.gz`.)

Once unzipped and untar, you can open `package/demons/index.html` with any WebkitBrowser on a desktop.

## Links

Recently added features can be found at [New and Noteworthy](https://github.com/senchalabs/jQTouch/blob/master/VERSIONS.md) page.

[Source code](http://github.com/senchalabs/jQTouch/archives/master), [issue tracking](http://github.com/senchalabs/jQTouch/issues), and [documentation](http://wiki.github.com/senchalabs/jQTouch/) are available on github.

[Watch this video preview](http://www.jqtouch.com/) to see it in action.

## Building your own version of jQTouch

### Dependencies

We have quite a few dependencies at the moment, as we build with Compass/SASS for stylesheets, which is only available via Ruby. The actual build system, however, is built on Grunt.

Please make sure you have the following installed:

* [Ruby](http://www.ruby-lang.org) — Comes default on Macs, Windows users can use [RubyInstaller](http://rubyinstaller.org)
* [Sass](http://sass-lang.com) & [Compass](http://compass-style.org) — Install both with `sudo gem install compass` once you have Ruby/RubyGems installed
* [Node.js & NPM](http://nodejs.org) — `brew install node`
* [Grunt CLI](http://gruntjs.com) — Install with `npm install -g grunt-cli` once you have Node.js as listed above.
* Local node packages — Run `npm install` from this directory

### Commands

#### `grunt` (default)

Will create a build of jQTouch in the `build/` directory, compiling any theme files and updating with source from the Zepto submodule. This must be run to preview jQTouch.

#### `grunt build`

This task is used only for iterative development. It does not update submodule, nor clean the build. (The `default` grunt task must be called once before this task.)

#### `grunt watch`

Will create the same build as `grunt build`, but will continue to watch for file changes to theme and source files, compiling/copying them into build every time you save. If you have a livereload browser extension installed and enabled, the page will update live after every change. (The `default` grunt task must be called once before this task.)

#### `grunt compass`

Only build the theme files. Typically, you'll want to use `grunt watch` for developing a custom theme. (The `default` grunt task must be called once before this task.)

#### `grunt test`

Run our test suite. (The `default` grunt task must be called once before this task.)

#### `grunt dist`

This is typically used internally for creating releases — It does everything the standard build does, but then additionally minifies all JS/CSS and updates the paths in demo files.



External Guides
---------------

Jonathan Stark has created an excellent introduction to jQTouch as part of his book, [Building iPhone Apps with HTML, CSS, and Javascript](http://ofps.oreilly.com/titles/9780596805784/chapAnimation.html).

[PeepCode did a screencast](http://peepcode.com/products/jqtouch) ($9), as well as a [cheat sheet](http://blog.peepcode.com/tutorials/2009/jqtouch-cheat-sheet), which have been helpful to many people.

Credits
-------

Created, and still occasionally maintained, by [David Kaneda](http://www.davidkaneda.com).

Maintained by [Thomas Yip](https://github.com/thomasyip).

Special thanks to [pinch/zoom](http://www.pinchzoom.com/) and [Jonathan Stark](http://jonathanstark.com/).

(c) 2009-2013 Sencha Labs.

jQTouch may be freely distributed under the MIT license.
See LICENSE.txt for license.
