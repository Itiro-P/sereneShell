[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Workspace.ui")]
public class Workspace : Gtk.Box {
    private static AstalNiri.Niri niri;
    private AstalNiri.Workspace _workspace;
    private ulong notify_handler = 0;
    private ulong focused_handler = 0;
    private bool hovered = false;
    private uint sync_pending = 0;

    private HashTable<string, Client> items = new HashTable<string, Client>(str_hash, str_equal);
    private HashTable<string, ulong> layout_handlers = new HashTable<string, ulong>(str_hash, str_equal);

    public AstalNiri.Workspace workspace {
        get { return _workspace; }
        set {
            if (_workspace != null) {
                _workspace.disconnect(notify_handler);
                _workspace.disconnect(focused_handler);
            }
            _workspace = value;
            notify_handler = _workspace.notify["idx"].connect(update_label);
            focused_handler = _workspace.notify["is-focused"].connect(update_visible_status);
            update_label();
        }
    }

    public string index { get; private set; }
    public bool reveal_clients { get; set; }
    public bool reveal_index { get; set; }

    [GtkChild] public unowned Gtk.Button index_button;
    [GtkChild] public unowned Gtk.Box clients;

    private GLib.List<ulong> niri_handlers = new GLib.List<ulong>();

    public Workspace(AstalNiri.Niri niri_instance, AstalNiri.Workspace w) {
        Object();
        if (niri == null) niri = niri_instance;

        this.workspace = w;

        niri_handlers.append(niri.window_opened_or_changed.connect((_) => schedule_sync()));
        niri_handlers.append(niri.window_closed.connect((_) => schedule_sync()));
        niri_handlers.append(niri.windows_changed.connect((_) => schedule_sync()));

        sync();
        update_visible_status();
    }

    private void schedule_sync() {
        if (sync_pending != 0) return;
        sync_pending = GLib.Idle.add(() => {
            sync();
            sync_pending = 0;
            return GLib.Source.REMOVE;
        });
    }

    private void sync() {
        var incoming = new HashTable<string, AstalNiri.Window>(str_hash, str_equal);
        this._workspace.windows.foreach((w) => incoming.insert(w.id.to_string(), w));

        // Saída antecipada se o conjunto não mudou
        if (incoming.size() == items.size()) {
            bool same = true;
            incoming.foreach((k, _) => {
                if (!items.contains(k)) same = false;
            });
            if (same) return;
        }

        // Remove janelas que saíram
        var to_remove = new GLib.List<string>();
        var iter = HashTableIter<string, Client>(items);
        string key;
        while (iter.next(out key, null)) {
            if (!incoming.contains(key)) to_remove.append(key);
        }
        foreach (var k in to_remove) remove_client(k);

        // Adiciona janelas novas
        incoming.foreach((k, w) => {
            if (!items.contains(k)) add_client(w);
            else reorder_client(items.lookup(k), w.layout.pos_in_scrolling_layout[0]);
        });

        update_visible_status();
    }

    private void add_client(AstalNiri.Window w) {
        var key = w.id.to_string();
        var client = new Client(niri, w);
        items.insert(key, client);
        clients.append(client);

        var handler = w.notify["layout"].connect(() => {
            if (client.get_parent() == clients)
                reorder_client(client, w.layout.pos_in_scrolling_layout[0]);
        });
        layout_handlers.insert(key, handler);

        reorder_client(client, w.layout.pos_in_scrolling_layout[0]);
    }

    private void remove_client(string key) {
        var client = items.lookup(key);
        if (client == null) return;

        if (layout_handlers.contains(key)) {
            var window = niri.get_window(uint64.parse(key));
            if (window != null) window.disconnect(layout_handlers.lookup(key));
            layout_handlers.remove(key);
        }

        clients.remove(client);
        items.remove(key);
    }

    private void reorder_client(Gtk.Widget client, uint pos_x) {
        if (client.get_parent() != clients) return;

        Gtk.Widget? insert_after = null;
        var child = clients.get_first_child();
        while (child != null) {
            if (child != client) {
                var c = child as Client;
                if (c != null) {
                    var window = niri.get_window(c.window_id);
                    if (window != null && window.layout.pos_in_scrolling_layout[0] < pos_x)
                        insert_after = child;
                }
            }
            child = child.get_next_sibling();
        }

        if (client.get_prev_sibling() != insert_after)
            clients.reorder_child_after(client, insert_after);
    }

    private void update_label() {
        this.index = this.workspace.idx.to_string();
    }

    private void update_visible_status() {
        var focused = this.workspace.is_focused;
        this.reveal_clients = (focused || hovered) && items.size() > 0;
        this.reveal_index = !this.reveal_clients;
    }

    [GtkCallback] public void on_hover_enter() { hovered = true;  update_visible_status(); }
    [GtkCallback] public void on_hover_leave() { hovered = false; update_visible_status(); }
    [GtkCallback] public void on_clicked()     { this.workspace.focus(); }

    public override void dispose() {
        if (sync_pending != 0) GLib.Source.remove(sync_pending);
        foreach (var h in niri_handlers) niri.disconnect(h);

        var iter = HashTableIter<string, ulong>(layout_handlers);
        string key; ulong handler;
        while (iter.next(out key, out handler)) {
            var window = niri.get_window(uint64.parse(key));
            if (window != null) window.disconnect(handler);
        }

        if (_workspace != null) {
            _workspace.disconnect(notify_handler);
        }
        base.dispose();
    }
}
