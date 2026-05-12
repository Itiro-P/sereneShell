[GtkTemplate(ui="/com/github/itiro-p/serene-shell/widgets/BackgroundPlayer.ui")]
public class BackgroundPlayer : Astal.Window {
    public AstalMpris.Player? player { get; set; default = null; }
    public string position_label { get; private set; default = "--:--"; }
    private List<ulong> handlers = new List<ulong>();
    public bool should_be_visible { get; set; default = false; }
    public Astal.Layer current_layer { get; set; default = Astal.Layer.BOTTOM; }

    public BackgroundPlayer(Gdk.Monitor monitor) {
        Object(
            application: App.instance,
            namespace : @"backgroundPlayer",
            name: @"backgroundPlayer-$(monitor.get_connector())",
            css_name: "BackgroundPlayer",
            gdkmonitor: monitor
        );

        var mpris = AstalMpris.get_default();

        SourceFunc update_player = () => {
            var active = get_active_player();
            this.should_be_visible = (active != null);

            if (active != this.player) {
                clean_handlers();
                
                this.player = active;

                if (this.player != null) {
                    this.handlers.append(this.player.notify["position"].connect(update_position_label));
                    this.handlers.append(this.player.notify["length"].connect(update_position_label));
                }
                update_position_label();
            }
            return false;
        };

        // Estado inicial
        update_player();

        mpris.player_added.connect((_) => update_player());
        mpris.player_closed.connect((_) => update_player());
    }

    private void clean_handlers() {
        if (this.player != null) {
            foreach (var handler in handlers) {
                this.player.disconnect(handler);
            }
        }
        while(!this.handlers.is_empty()) {
            this.handlers.remove(this.handlers.index(0));
        }
    }

    private void update_position_label() {
        if(this.player == null) return;
        if (this.player.position <= 0.0 || this.player.length <= 0.0) {
            this.position_label = "--:-- - --:--";
            return;
        }

        this.position_label = formatTime(this.player.position) + " - " + formatTime(this.player.length);
    }

    public static AstalMpris.Player? get_active_player() {
        var mpris = AstalMpris.get_default();
        foreach (var p in mpris.players) {
            if (p.playback_status == AstalMpris.PlaybackStatus.PLAYING)
                return p;
        }

        if (mpris.players.length() > 0)
            return mpris.players.data;

        return null;
    }

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
        if (this.player == null) return false;
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

    public override void dispose() {
        this.clean_handlers();
        base.dispose();
    }
}