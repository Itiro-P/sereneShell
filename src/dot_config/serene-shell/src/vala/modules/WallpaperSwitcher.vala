[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/WallpaperSwitcher.ui")]
public class WallpaperSwitcher : Gtk.Box {
    [GtkChild]
    private unowned Gtk.FlowBox flow_box;

    private string _monitor_connector = "";
    public string monitor_connector {
        get { return _monitor_connector; }
        set { _monitor_connector = value; }
    }

    private string active_wallpaper = "";
    private GLib.HashTable<string, WallpaperItem> items =
        new GLib.HashTable<string, WallpaperItem>(str_hash, str_equal);

    construct {
        var service = WallpapersService.get_default();
        service.wallpaper_added.connect(on_wallpaper_added);
        service.wallpaper_removed.connect(on_wallpaper_removed);
        //service.tick.connect(on_tick);

        service.get_wallpapers().foreach((path, paintable) => {
            on_wallpaper_added(path, paintable);
        });
    }

    private void on_wallpaper_added(string path, Gdk.Paintable paintable) {
        var item = new WallpaperItem(path, paintable, 288, 162);
        item.picked.connect(on_wallpaper_picked);
        items[path] = item;
        flow_box.append(item);
    }

    private void on_wallpaper_removed(string path) {
        var item = items[path];
        if (item != null) {
            flow_box.remove(item);
            items.remove(path);
        }
    }

    private void on_wallpaper_picked(string path) {
        apply_wallpaper(path);
    }

    private void set_active_wallpaper(string path) {
        if (active_wallpaper == path) return;

        var prev = items[active_wallpaper];
        if (prev != null) prev.active = false;

        active_wallpaper = path;

        var next = items[path];
        if (next != null) next.active = true;
    }

    private void apply_wallpaper(string path) {
        set_active_wallpaper(path);

        var options = new Awww.ParserOptions() {
            resize = Awww.Resize.CROP,
            filter = Awww.Filter.LANCZOS3,
            transition_type = Awww.TransitionType.GROW,
            transition_pos = Awww.TransitionPos.CENTER,
            transition_duration = 0.8,
            transition_step = 60,
            outputs = monitor_connector
        };

        Awww.Manager.get_default().set_wallpaper.begin(path, options);
    }

    private void on_tick() {
        Awww.Manager.get_default().check_last_wallpaper.begin(monitor_connector, (obj, res) => {
            var last = Awww.Manager.get_default().check_last_wallpaper.end(res);

            var next_img = WallpapersService.get_default().get_random_image();
            if (next_img != null && next_img != active_wallpaper) {
                apply_wallpaper(next_img);
            }
        });
    }
}