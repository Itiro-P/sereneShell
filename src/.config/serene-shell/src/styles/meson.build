sass = find_program('sass', required: true)

css = custom_target(
  'scss',
  input: files('index.scss'),
  command: [sass, '@INPUT@', '@OUTPUT@'],
  output: 'style.css',
)