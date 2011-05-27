/*

            _/    _/_/    _/_/_/_/_/                              _/
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/
       _/
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Maintained by Jonathan Stark <http://jonathanstark.com/>
    Sponsored by Sencha Labs <http://www.sencha.com/>

    Documentation and issue tracking on GitHub <http://wiki.github.com/senchalabs/jQTouch/>

    (c) 2009-2011 by jQTouch project members.
    See LICENSE.txt for license.

    $Revision: $
    $Date: $
    $LastChangedBy: $

*/

(function($) {
    $.jQTouch = function(options) {
        options.framework = $;
        var core = TouchCore(options);
        return core;
    };
})(Zepto);
