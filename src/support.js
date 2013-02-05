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

    (c) 2009-2013 Sencha Labs
    jQTouch may be freely distributed under the MIT license.

*/

(function() {
  function warn(message) {
      if (window.console !== undefined && $.jQTouch.defaults.debug) {
          console.warn(message);
      }
  }

  function supportForTransform3d() {
      var head, body, style, div, result;

      head = document.getElementsByTagName('head')[0];
      body = document.body;

      style = document.createElement('style');
      style.textContent = '@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-webkit-transform-3d){#jqt-3dtest{height:3px}}';

      div = document.createElement('div');
      div.id = 'jqt-3dtest';

      // Add to the page
      head.appendChild(style);
      body.appendChild(div);

      // Check the result
      result = div.offsetHeight === 3;

      // Clean up
      style.parentNode.removeChild(style);
      div.parentNode.removeChild(div);

      // Pass back result
      warn('Support for 3d transforms: ' + result);
      return result;
  }

  function supportIOS5() {
      var support = false;
      var REGEX_IOS_VERSION = /OS (\d+)(_\d+)* like Mac OS X/i;

      var agentString = window.navigator.userAgent;
      if (REGEX_IOS_VERSION.test(agentString)) {
          support = (REGEX_IOS_VERSION.exec(agentString)[1] >= 5);
      }
      return support;
  }

  function start() {
      // Store some properties in a support object
      if (!$.support) $.support = {};
      $.support.animationEvents = (typeof window.WebKitAnimationEvent !== 'undefined');
      $.support.touch = (typeof window.TouchEvent !== 'undefined') && (window.navigator.userAgent.indexOf('Mobile') > -1) && jQTSettings.useFastTouch;
      $.support.transform3d = supportForTransform3d();
      $.support.ios5 = supportIOS5();

      if (!$.support.touch) {
          warn('This device does not support touch interaction, or it has been deactivated by the developer. Some features might be unavailable.');
      }
      if (!$.support.transform3d) {
          warn('This device does not support 3d animation. 2d animations will be used instead.');
      }
  }

  $(document).ready(function() {
      start();
  });
})(); // Double closure, ALL THE WAY ACROSS THE SKY
