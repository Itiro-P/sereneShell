[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/QuickSettings.ui")]
public class QuickSettings : Gtk.Box {
    [GtkChild]
    private unowned Gtk.Calendar calendar;

    [GtkChild]
    private unowned Gtk.Popover popover;

    construct {
        popover.show.connect(() => {
            calendar.set_date (new GLib.DateTime.now_local());
        });
    }
}