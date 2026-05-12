[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Client.ui")]
public class Client : Gtk.Button {
    private static AstalNiri.Niri niri_instance;
    private AstalNiri.Window client;
    public uint64 window_id { get; construct; }

    [GtkChild] private unowned Gtk.Image icon;

    public Client(AstalNiri.Niri niri, AstalNiri.Window w) {
        Object(window_id: w.id);
        if (niri_instance == null) niri_instance = niri;
        client = w;
        update_icon(w.app_id);
        w.changed.connect(() => update_icon(w.app_id));
    }

    private void update_icon(string? app_id) {
        if (app_id == null) { icon.set_from_icon_name("application-x-executable"); return; }

        var lower = app_id.down();
        var icon_theme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default());

        if (icon_theme.has_icon(app_id)) { icon.set_from_icon_name(app_id); return; }
        if (icon_theme.has_icon(lower))  { icon.set_from_icon_name(lower);  return; }

        var desktop = new GLib.DesktopAppInfo(app_id + ".desktop")
                      ?? new GLib.DesktopAppInfo(lower + ".desktop");
        if (desktop != null) {
            var gicon = desktop.get_icon();
            if (gicon != null) { icon.set_from_gicon(gicon); return; }
        }

        var short_id = app_id.split(".")[app_id.split(".").length - 1].replace("_", "-");
        foreach (var query in new string[] { app_id, short_id }) {
            var results = GLib.DesktopAppInfo.search(query);
            for (int i = 0; results[i] != null; i++) {
                var found = new GLib.DesktopAppInfo(results[i][0]);
                if (found != null) {
                    var gicon = found.get_icon();
                    if (gicon != null) { icon.set_from_gicon(gicon); return; }
                }
                break;
            }
        }

        icon.set_from_icon_name("application-x-executable");
    }

    [GtkCallback]
    public void on_clicked() {
        client.focus((int) client.id);
    }
}