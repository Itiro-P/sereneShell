[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/WallpaperItem.ui")]
public class WallpaperItem : Gtk.Button {
    [GtkChild]
    private unowned Adw.Clamp clamp_h;
    [GtkChild]
    private unowned Adw.Clamp clamp_w;
    [GtkChild]
    private unowned Gtk.Picture picture;

    public string full_path { get; private set; }

    private bool _active = false;
    public bool active {
        get { return _active; }
        set {
            _active = value;
            if (value) {
                add_css_class("active");
            } else {
                remove_css_class("active");
            }
        }
    }

    public signal void picked(string path);

    public WallpaperItem(string full_path, Gdk.Paintable paintable, int preview_width, int preview_height) {
        this.full_path = full_path;

        clamp_h.maximum_size = preview_height;
        clamp_h.height_request = preview_height;
        clamp_w.maximum_size = preview_width;
        clamp_w.width_request = preview_width;
        picture.paintable = paintable;

        this.clicked.connect(() => {
            picked(this.full_path);
        });
    }
}