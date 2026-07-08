blp = find_program('blueprint-compiler', required: true)

subdir('widgets')
subdir('modules')

blp_sources = [
  blp_widgets,
  blp_modules
]

ui = custom_target(
  'blueprints',
  input: blp_sources,
  output: 'blueprints-stamp',
  command: [
    blp, 'batch-compile',
    meson.current_build_dir(),
    meson.current_source_dir(),
    '@INPUT@',
  ],
  build_by_default: true,
)