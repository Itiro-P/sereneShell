public class WallpapersService : GLib.Object {
    private static WallpapersService? _default;
    public static WallpapersService get_default() {
        if (_default == null) _default = new WallpapersService();
        return _default;
    }

    public const int PREVIEW_WIDTH = 288;
    public const int PREVIEW_HEIGHT = 162;
    private const uint POLL_TIME_MS = 240000;
    private const string[] IMAGE_EXTENSIONS = { ".gif", ".png", ".jpg", ".jpeg", ".webp", ".bmp" };

    private string wallpaper_dir;
    private GLib.HashTable<string, Gdk.Paintable> wallpapers =
        new GLib.HashTable<string, Gdk.Paintable>(str_hash, str_equal);

    public signal void wallpaper_added(string path, Gdk.Paintable paintable);
    public signal void wallpaper_removed(string path);
    public signal void tick();

    private WallpapersService() {
        wallpaper_dir = GLib.Path.build_filename(
            GLib.Environment.get_home_dir(), ".config", "serene-shell", "wallpapers"
        );
        init_wallpapers.begin();

        GLib.Timeout.add(POLL_TIME_MS, () => {
            tick();
            return GLib.Source.CONTINUE;
        });
    }

    private bool is_image(string filename) {
        var lower = filename.down();
        foreach (var ext in IMAGE_EXTENSIONS) {
            if (lower.has_suffix(ext)) return true;
        }
        return false;
    }

    private async void init_wallpapers() {
        var dir = GLib.File.new_for_path(wallpaper_dir);
        FileEnumerator enumerator;

        try {
            enumerator = yield dir.enumerate_children_async(
                FileAttribute.STANDARD_NAME,
                FileQueryInfoFlags.NONE,
                Priority.DEFAULT,
                null
            );
        } catch (Error e) {
            warning("Critical error scanning wallpapers: %s", e.message);
            return;
        }

        int loaded = 0;

        while (true) {
            List<FileInfo> infos;
            try {
                infos = yield enumerator.next_files_async(10, Priority.DEFAULT, null);
            } catch (Error e) {
                warning("Error listing wallpapers: %s", e.message);
                break;
            }
            if (infos.length() == 0) break;

            foreach (var info in infos) {
                var name = info.get_name();
                if (!is_image(name)) continue;

                var full_path = GLib.Path.build_filename(wallpaper_dir, name);

                try {
                    var paintable = yield load_texture(full_path);
                    wallpapers[full_path] = paintable;
                    wallpaper_added(full_path, paintable);
                    loaded++;
                } catch (Error e) {
                    warning("Failed to load wallpaper: %s (%s)", name, e.message);
                }
            }
        }

        message("Loaded %d wallpapers.", loaded);
    }

    private async Gdk.Paintable load_texture(string path) throws Error {
        var file = GLib.File.new_for_path(path);
        var loader = new Gly.Loader(file);

        var image = loader.load();
        var frame = image.next_frame();

        return GlyGtk4.frame_get_texture(frame);
    }

    public string? get_random_image() {
        var keys = wallpapers.get_keys();
        if (keys.length() == 0) return null;

        var index = GLib.Random.int_range(0, (int32) keys.length());
        return keys.nth_data(index);
    }

    public GLib.HashTable<string, Gdk.Paintable> get_wallpapers() {
        return wallpapers;
    }
}