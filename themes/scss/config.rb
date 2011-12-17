# Manually bring in Compass Recipes for styling shortcuts
require File.join(File.dirname(__FILE__), '..', 'compass-recipes', 'lib', 'compass-recipes')

sass_path = File.dirname(__FILE__)
css_path = File.join(sass_path, "..", "css")

output_style = :expanded # nested/expanded/compact/compressed
environment = :development # development/production

# Rebuilt autotically with production settings in Ant build