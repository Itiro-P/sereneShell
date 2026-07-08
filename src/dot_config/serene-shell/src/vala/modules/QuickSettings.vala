[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/QuickSettings.ui")]
public class QuickSettings : Gtk.Box {
    [GtkChild]
    private unowned Gtk.Calendar calendar;
    [GtkChild]
    private unowned Gtk.Popover popover;
    [GtkChild]
    private unowned Adw.NavigationView nav_view;
    [GtkChild]
    private unowned Gtk.Button wallpaper_button;
    [GtkChild]
    private unowned WallpaperSwitcher wallpaper_switcher;

    public string monitor_connector { get; construct; }

    public QuickSettings(string gdkmonitor) {
        Object(monitor_connector: gdkmonitor);
    }

    construct {
        wallpaper_switcher.monitor_connector = monitor_connector;

        popover.show.connect(() => {
            calendar.set_date(new GLib.DateTime.now_local());
            nav_view.pop_to_tag("main");
        });

        wallpaper_button.clicked.connect(() => {
            nav_view.push_by_tag("wallpapers");
        });
    }
}