# Manually bring in Compass Recipes for styling shortcuts
require File.join(File.dirname(__FILE__), '..', 'compass-recipes', 'lib', 'compass-recipes')

sass_path = File.dirname(__FILE__)
css_path = File.join(sass_path, "..", "css")

output_style = :expanded # nested/expanded/compact/compressed
environment = :development # development/production

# Rebuilt automatically with production settings in Ant build

# for repeating-linear-gradient
# https://github.com/chriseppstein/compass/issues/401
Compass::BrowserSupport.add_support('repeating-linear-gradient', 'webkit', 'moz', 'o', 'ms')