project(
  'sereneShell',
  version: '0.1',
  default_options: [
    'prefix=/usr',
  ],
)

prefix = get_option('prefix')
bindir = prefix / get_option('bindir')
datadir = prefix / get_option('datadir') / meson.project_name()

ags = find_program('ags', required: true)
find_program('gjs', required: true)

custom_target(
  input: files('app.tsx'),
  command: [
    ags,
    'bundle',
    '--gtk', '4',
    '--define', 'DATADIR="' + datadir + '"',
    '--root', meson.project_source_root(),
    meson.project_source_root() / 'app.tsx',
    '@OUTPUT@',
  ],
  output: 'sereneShellApp',
  install: true,
  install_dir: datadir,
  build_always_stale: true,
)

configure_file(
  input: files('sereneShell'),
  output: meson.project_name(),
  configuration: {'DATADIR': datadir},
  install: true,
  install_dir: bindir,
  install_mode: 'rwxr-xr-x',
)

install_emptydir(datadir / 'assets')
install_emptydir(datadir / 'src/styles')
