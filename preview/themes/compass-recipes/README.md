# Compass Recipes ![project status](http://stillmaintained.com/MoOx/compass-recipes.png) #

This project is a collection of Sass mixins using Compass that you can use or learn from.

## [Demos](http://moox.github.com/compass-recipes/)

*This are demos of the repository at his current state. So it will be not reflection what is available into the last stable gem. To get what you see in the demos, see Installation to see how to install the repo at his current state*

## What do we have here ?

* [backgrounds](http://moox.github.com/compass-recipes/recipes/background/) (patterns)
* [bases](http://moox.github.com/compass-recipes/recipes/base/) (just normalize.css from @necolas for now)
* [effects](http://moox.github.com/compass-recipes/recipes/effect/) (visual ones, not animations)
* [form skins](http://moox.github.com/compass-recipes/recipes/form/skin/) (just one, feel free to pull news)
* [icons](http://moox.github.com/compass-recipes/recipes/icon) recipes (just rules to use icons, not icons themselves)
* [layout](http://moox.github.com/compass-recipes/recipes/layout) recipes
* [media queries](http://moox.github.com/compass-recipes/recipes/media-queries) (predefined for commons devices width)
* [shadows](http://moox.github.com/compass-recipes/recipes/shadow/) (funky ones)
* [shapes](http://moox.github.com/compass-recipes/recipes/shape/) (geometrical ones, and some others fancy)
* [shared](http://moox.github.com/compass-recipes/recipes/shared/) (commons stuffs like hacks or tricks)
* [ui](http://moox.github.com/compass-recipes/recipes/ui/) (stuffs for UI - more incomming)

* *more incomming (see [compass recipes issues](/MoOx/compass-recipes/issues)), feel free to make a pull request to add your own !!*

## Installation

[Compass-Recipes is now available as a gem on RubyGems.org](https://rubygems.org/gems/compass-recipes). So installation is quite easy.

```shell
gem install compass-recipes
```

/!\ *If you want all latests recipes, you can just checkout the recipes (or download as zip) and add '{your-path-here-or-./}compass-recipes/stylesheets' using `additional_import_paths` or `add_import_path` (see [Compass configuration reference](http://compass-style.org/help/tutorials/configuration-reference/)*

# Usage

When compass-recipes installed, you just need to require the compass plugin in your project

```css
require 'compass-recipes'
```

Then you can include some recipes like this

```css
@import "recipes/shape/triangle";
.my-triangle
{
    @include triangle;
}
```

Like Compass does, you can include all recipes in a folder like this

```css
@import "recipes/shape";

.my-triangle
{
    @include triangle;
}

.my-square
{
    @include square;
}
```

## Author
 
Compass-Recipes is maintained by Maxime Thirouin, a front-end web developer working for Shopbot-inc.com

## Open to All
Fork, modify, push, submit pull request ! That's easy !

*I'm not a Ruby coder, so anyone which want to help me for anything will be appreciated !*

## Build Documentation

First you need bundle

```bundle install```

Then, to build the gh-pages from the `tests/`, you need to call

```bundle exec rake pages```

## Thanks (indirect contributors)

This project will never exists without these people : @necolas, @simurai, @chriscoyier, @leaverou.

They give me inspiration (and snippets of code!).

## [MIT Licence](http://moox.mit-license.org/)

##### Notes
*Readme created using [Mou.app](http://mouapp.com/)*