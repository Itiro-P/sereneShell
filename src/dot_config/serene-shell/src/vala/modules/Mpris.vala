[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Mpris.ui")]
public class Mpris : Gtk.Box {
    public AstalMpris.Mpris mpris { get; private set; }

    [GtkChild]
    private unowned Adw.Carousel players;

    [GtkChild]
    private unowned Adw.ViewStack stack;

    private List<ulong> handlers;
    construct {
        this.mpris = AstalMpris.get_default();
        this.mpris.players.@foreach((p) => this.on_player_added(p));
        handlers.append(this.mpris.player_added.connect((p) => this.on_player_added(p)));
        handlers.append(this.mpris.player_closed.connect((p) => this.on_player_removed(p)));
        this.update_stack();
    }

    private void update_stack() {
        this.stack.set_visible_child_name(
            this.mpris.players.length() > 0 ? "music" : "empty"
        );
    }

    private void on_player_added(AstalMpris.Player player) {
        this.players.append(new Player(player));
        this.update_stack();
    }

    private void on_player_removed(AstalMpris.Player player) {
        for (int i = 0; i < this.players.n_pages; i++) {
            Player p = (Player)this.players.get_nth_page(i);
            if (p.player == player) {
                this.players.remove(p);
                break;
            }
        }
        this.update_stack();
    }

    public override void dispose() {
        foreach(var handler in this.handlers) {
            this.mpris.disconnect(handler);
        }
        base.dispose();
    }
}