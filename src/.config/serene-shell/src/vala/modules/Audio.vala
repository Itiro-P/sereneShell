[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Audio.ui")]
public class Audio : Gtk.Box {
    public AstalWp.Wp wp { get; construct set; }

    public string spkr_percentage { get; set; }
    public string spkr_volume_icon { get; set; }
    
    public string mic_percentage { get; set; default = ""; }
    public string mic_volume_icon { get; set; default = ""; }

    public bool reveal_child_spkr { get; set; default = false; }
    public bool reveal_child_mic { get; set; default = false; }

    private AstalWp.Endpoint spkr;
    private AstalWp.Endpoint mic;

    construct {
        this.wp = AstalWp.get_default();

        spkr = this.wp.get_default_speaker();

        spkr.bind_property("volume", this, "spkr-percentage", 
            BindingFlags.SYNC_CREATE,
        (_, src, ref target) => {
            target.set_string(@"$(Math.floor(spkr.volume * 100))%");
            return true;
        });
        spkr.bind_property("volume-icon", this, "spkr-volume-icon",
            BindingFlags.SYNC_CREATE);

        mic = this.wp.get_default_microphone();
        mic.bind_property("volume", this, "mic-percentage", 
            BindingFlags.SYNC_CREATE,
            (_, src, ref target) => {
            target.set_string(@"$(Math.floor(mic.volume * 100))%");
            return true;
        });
        mic.bind_property("volume-icon", this, "mic-volume-icon", BindingFlags.SYNC_CREATE);
    }

    private void executeCommand(string[] args) {
        try {
            Process.spawn_async("/", args, null, SpawnFlags.SEARCH_PATH, null, null);
        } catch (GLib.SpawnError e) {
            printerr("Error executing %s: %s", args[0], e.message);
        }
    }

    [GtkCallback]
    private void toggle_mute_spkr() {
        this.spkr.set_mute(!this.spkr.get_mute());
    }

    [GtkCallback]
    private void toggle_mute_mic() {
        this.mic.set_mute(!this.mic.get_mute());
    }

    [GtkCallback]
    private bool on_scroll_spkr(double dx, double dy) {
        string[] args = {"swayosd-client", "--output-volume", (dy < 0 ? "+2" : "-2"), "--max-volume", "100"};
        executeCommand(args);
        return true;
    }

    [GtkCallback]
    private bool on_scroll_mic(double dx, double dy) {
        string[] args = {"swayosd-client", "--input-volume", (dy < 0 ? "+2" : "-2"), "--max-volume", "100"};
        executeCommand(args);
        return true;
    }

    [GtkCallback]
    private void on_hover_enter_spkr() {
        this.reveal_child_spkr = true;
    }

    [GtkCallback]
    private void on_hover_leave_spkr() {
        this.reveal_child_spkr = false;
    }

    [GtkCallback]
    private void on_hover_enter_mic() {
        this.reveal_child_mic = true;
    }

    [GtkCallback]
    private void on_hover_leave_mic() {
        this.reveal_child_mic = false;
    }

    [GtkCallback]
    private void on_right_click() {
        executeCommand({"pavucontrol"});
    }
}