subdir('vala')
subdir('blueprints')
subdir('styles')

pkgdatadir = get_option('prefix') / get_option('datadir')
bindir = get_option('prefix') / get_option('bindir')

gresource = files('serene-shell.gresource.xml')

dependencies = [
  dependency('gtk4-layer-shell-0'),
  dependency('json-glib-1.0'),
  dependency('gio-2.0'),
  dependency('gio-unix-2.0'),
  dependency('astal-io-0.1'),
  dependency('glib-2.0'),
  dependency('astal-4-4.0'),
  dependency('astal-apps-0.1'),
  dependency('astal-battery-0.1'),
  dependency('astal-wireplumber-0.1'),
  dependency('astal-network-0.1'),
  dependency('libnm'),
  #dependency('astal-apps-0.1'),
  dependency('astal-cava-0.1'),
  dependency('astal-niri-0.1'),
  dependency('astal-mpris-0.1'),
  dependency('astal-power-profiles-0.1'),
  dependency('astal-tray-0.1'),
  dependency('astal-bluetooth-0.1'),
  dependency('libadwaita-1')
]

resource = import('gnome').compile_resources(
  'data',
  gresource,
  dependencies: [ui, css],
  source_dir: [
    meson.current_source_dir(),
    meson.current_build_dir()
  ]
)

executable(
  meson.project_name(),
  dependencies: dependencies,
  sources: [vala_sources, 'App.vala', resource],
  link_args: ['-lm'],
  install: true,
  install_dir: bindir,
)