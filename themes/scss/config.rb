require File.join(File.dirname(__FILE__), '..', 'accessories', 'lib', 'accessories')

sass_path = File.dirname(__FILE__)
css_path = File.join(sass_path, "..", "css")

output_style = :expanded # nested/expanded/compact/compressed
environment = :development # development/production

# Rebuilt autotically with production settings in Ant build