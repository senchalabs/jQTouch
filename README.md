jQTouch
=======

Create powerful mobile apps with just HTML, CSS, and Zepto.js (or jQuery).
--------------------------------------------------------------------------

jQTouch is a JavaScript plugin which works with either Zepto.js or jQuery, and comes with smooth animations, navigation, and themes for mobile WebKit browsers (as found in iOS, Android, BlackBerry, and WebOS).

- [Easy to install](https://github.com/senchalabs/jQTouch/wiki/Getting-Started). Get up and running in a few minutes.
- [Entirely customizable](https://github.com/senchalabs/jQTouch/wiki/Initialization-Options) with selector options
- [Theme support](https://github.com/senchalabs/jQTouch/wiki/Theming), including default Apple and jQTouch custom themes
- [Callback functions](https://github.com/senchalabs/jQTouch/wiki/Callback-Events) throughout, including swipe and orientation change detection
- Page history management and CSS3 page transitions, including 3D flip, cube, and swap
- Failover to 2D animations for devices that don't support 3D
- Easily allow apps to run in fullscreen mode with custom icons and startup screens
- The power of jQuery to build AJAX applications
- New demos: Clock and Todo

## Upcoming Features
*Note: Upcoming features are developed in the master branch, and are not to be considered stable. For official releases, please see the [version tags](https://github.com/senchalabs/jQTouch/tags).*

- [Zepto](https://github.com/madrobby/zepto) integration - Use with Zepto.js instead of jQuery to cut down on precious bandwidth. Zepto.js is very similar API to jQuery, but optimized for WebKit and thus about 20kb smaller.
- Sass-based stylesheets, easily modified with variables, and optimized for size.
- Image-less stylesheets -- Using [Compass Recipes](https://github.com/senchalabs/compass-recipes), we have recreated all of the gradients and background patterns with CSS. This way, they are resolution independent, dynamically theme-able, and lower bandwidth.

[Source code](http://github.com/senchalabs/jQTouch/archives/master), [issue tracking](http://github.com/senchalabs/jQTouch/issues), and [documentation](http://wiki.github.com/senchalabs/jQTouch/) are available on github.

[Watch this video preview](http://www.jqtouch.com/) to see it in action.

## Building / Contribute
[![Build Status](https://api.travis-ci.org/senchalabs/jQTouch.png)](http://travis-ci.org/senchalabs/jQTouch)

Dependencies:
<table>
<thead>
  <tr><th>target</th><th>description</th><th>dependencies</th></tr>
</thead>
<tbody>
  <tr><td>`grunt --help`</td><td>List available build targets.</td><td>nodejs, grunt: ex, `brew install node && npm install grunt -g && npm install`</td></tr>
  <tr><td>`grunt css`</td><td>Build SASS resources into css.</td><td>`ruby`, `compass` + `grunt --help` dependencies: ex, `gem install compass`</td></tr>
  <tr><td>`grunt test`</td><td>Run all unit tests.</td><td>`phantomjs` + `grunt --help` dependencies: ex, `brew install phantomjs`</td></tr>
  <tr><td>`grunt dist`</td><td>Build a distribution.</td><td>`grunt css` + `grunt test` dependencies</td></tr>
</tbody>
</table>

The command `grunt dist` builds a folder structure under `jqtouch-${release.version}-${release.id}`.

External Guides
---------------

Jonathan Stark has created an excellent introduction to jQTouch as part of his book, [Building iPhone Apps with HTML, CSS, and Javascript](http://ofps.oreilly.com/titles/9780596805784/chapAnimation.html).

[PeepCode did a screencast](http://peepcode.com/products/jqtouch) ($9), as well as a [cheat sheet](http://blog.peepcode.com/tutorials/2009/jqtouch-cheat-sheet), which have been helpful to many people.

Credits
-------

Created, and still occasionally maintained, by [David Kaneda](http://www.davidkaneda.com).

Maintained by [Thomas Yip](https://github.com/thomasyip).

Special thanks to [pinch/zoom](http://www.pinchzoom.com/) and [Jonathan Stark](http://jonathanstark.com/).

(c) 2009-2012 Sencha Labs.

jQTouch may be freely distributed under the MIT license.
See LICENSE.txt for license.
