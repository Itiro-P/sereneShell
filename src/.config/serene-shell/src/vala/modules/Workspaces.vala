[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Workspaces.ui")]
public class Workspaces : Gtk.Box {
    private AstalNiri.Niri niri;
    private HashTable<string, Workspace> workspaces = new HashTable<string, Workspace>(str_hash, str_equal);
    private ulong workspaces_handler = 0;

    public AstalNiri.Output output { get; construct set; }

    construct {
        this.niri = AstalNiri.get_default();
        this.visible = false;

        ulong handler = 0;
        handler = this.notify["output"].connect(() => {
            if (this.output != null) {
                setup();
                this.disconnect(handler);
            }
        });
        if (this.output != null) {
            setup();
            this.disconnect(handler);
        }
    }

    private void setup() {
        string connector = this.output.name;
        sync_workspaces(connector);
        workspaces_handler = niri.workspaces_changed.connect((_) => sync_workspaces(connector));
    }

    private void sync_workspaces(string connector) {
        var incoming_ids = new HashTable<string, bool>(str_hash, str_equal);

        niri.workspaces.foreach((w) => {
            if (w.output != connector) return;
            var id = w.id.to_string();
            incoming_ids.insert(id, true);

            if (!this.workspaces.contains(id)) {
                var widget = new Workspace(niri, w);
                this.workspaces.insert(id, widget);
                this.append(widget);
            } else {
                this.workspaces.lookup(id).workspace = w;
            }
        });

        var to_remove = new GLib.List<string>();
        this.workspaces.foreach((id, _) => {
            if (!incoming_ids.contains(id)) to_remove.append(id);
        });
        foreach (var id in to_remove) {
            this.remove(this.workspaces.lookup(id));
            this.workspaces.remove(id);
        }

        this.visible = this.workspaces.size() > 0;
    }

    public override void dispose() {
        if (workspaces_handler != 0) niri.disconnect(workspaces_handler);
        base.dispose();
    }
}