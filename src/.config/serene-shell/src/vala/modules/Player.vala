[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Player.ui")]
public class Player: Gtk.Box {
    public AstalMpris.Player player { get; construct; }
    public File cover_file { get; private set; }
    public string position_label { get; private set; default = "--:--"; }
    private List<ulong> handlers;

    [GtkCallback]
    public void next() {
        this.player.next();
    }

    [GtkCallback]
    public void prev() {
        this.player.previous();
    }

    [GtkCallback]
    public void play_pause() {
        this.player.play_pause();
    }

    [GtkCallback]
    public void raise() {
        this.player.raise();
    }

    [GtkCallback]
    public string pause_icon(AstalMpris.PlaybackStatus status) {
        switch (status) {
        case AstalMpris.PlaybackStatus.PLAYING:
            return "media-playback-pause-symbolic";

        case AstalMpris.PlaybackStatus.PAUSED:
        case AstalMpris.PlaybackStatus.STOPPED:
        default:
            return "media-playback-start-symbolic";
        }
    }

    [GtkCallback]
    public bool on_slider_change_value(Gtk.Range range, Gtk.ScrollType scrollType, double value) {
        this.player.position = value;

        var seekStep = 5;
        switch(scrollType) {
            case Gtk.ScrollType.START:
                player.previous();
                break;

            case Gtk.ScrollType.END:
                player.next();
                break;

            case Gtk.ScrollType.STEP_BACKWARD:
            case Gtk.ScrollType.STEP_DOWN:
                player.position = Math.fmax(player.position - seekStep, 0);
                break;

            case Gtk.ScrollType.STEP_FORWARD:
            case Gtk.ScrollType.STEP_UP:
                player.position = Math.fmin(player.position + seekStep, this.player.length);
                break;

            case Gtk.ScrollType.JUMP:
                player.position = value;
                break;

            default:
                player.position = value;
                break;
        }
        return true;
    }

    private void update_cover() {
        if (this.player.cover_art != null && this.player.cover_art != "") {
            File file = File.new_for_path(this.player.cover_art);
            if (file.query_exists(null)) {
                this.cover_file = file;
                return;
            }
        }
    }

    private string formatTime(double seconds) {
        if (seconds <= 0.0) return "--:--";
        int total = (int) Math.floor(seconds);
        int hours = total / 3600;
        int minutes = (total % 3600) / 60;
        int secs = total % 60;

        string seconds_str = (secs < 10) ? ("0" + secs.to_string()) : secs.to_string();

        if (hours > 0) {
            string minutes_str = (minutes < 10) ? ("0" + minutes.to_string()) : minutes.to_string();
            return hours.to_string() + ":" + minutes_str + ":" + seconds_str;
        } else {
            return minutes.to_string() + ":" + seconds_str;
        }
    }

    private void update_position_label() {
        if (this.player.position <= 0.0 || this.player.length <= 0.0) {
            this.position_label = "--:-- - --:--";
            return;
        }

        this.position_label = formatTime(this.player.position) + " - " + formatTime(this.player.length);
    }

    public Player(AstalMpris.Player player) {
        Object(player: player);
    }

    construct {
        this.handlers.append(player.notify["cover-art"].connect(() => update_cover()));
        this.handlers.append(player.notify["position"].connect(() => update_position_label()));
        this.handlers.append(player.notify["length"].connect(() => update_position_label()));
        update_cover();
    }

    public override void dispose() {
        foreach(var handler in this.handlers) {
            this.player.disconnect(handler);
        }
        base.dispose();
    }
}