[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Tray.ui")]
public class Tray : Gtk.Box {
    private AstalTray.Tray tray = AstalTray.get_default();
    private HashTable<string, Gtk.Widget> items;

    private ulong added_handler;
    private ulong removed_handler;

    construct {
        this.visible = false;
        this.items = new HashTable<string, Gtk.Widget>(str_hash, str_equal);

        this.tray.items.foreach((item) => {
            var tray_item = new TrayItem(item);
            this.items.insert(item.item_id, tray_item);
            this.append(tray_item);
            this.visible = true;
        });

        added_handler = this.tray.item_added.connect((item_id) => {
            if (this.items.contains(item_id)) return;
            var item_obj = tray.get_item(item_id);
            if (item_obj == null) return;
            
            var item = new TrayItem(item_obj);
            this.items.insert(item_id, item);
            this.append(item);
            this.visible = true;
        });

        removed_handler = this.tray.item_removed.connect((item_id) => {
			if(this.items.contains(item_id)) {
				this.remove(this.items.get(item_id));
				this.items.remove(item_id);
                this.visible = items.size() > 0;
			}
        });
    }

	public override void dispose() {
		this.tray.disconnect(added_handler);
        this.tray.disconnect(removed_handler);

		base.dispose();
	}

    public class TrayItem : Gtk.Button {
        public AstalTray.TrayItem item { get; construct; }

        private Gtk.PopoverMenu menu;
        private Gtk.Image icon;
        private Gtk.GestureClick lc;
        private Gtk.GestureClick rc;

        private List<ulong> handlers;

        public TrayItem(AstalTray.TrayItem item) {
            Object(item: item);
        }

        static construct {
            set_css_name("tray-item");
        }

        construct {
            icon = new Gtk.Image();
            item.bind_property("gicon", icon, "gicon", BindingFlags.SYNC_CREATE);
            this.set_child(icon);

            menu = new Gtk.PopoverMenu.from_model(item.menu_model);
            menu.set_parent(this);
            menu.set_position(Gtk.PositionType.RIGHT);

            handlers.append(item.notify["menu-model"].connect(() => {
                menu.menu_model = item.menu_model;
            }));

            handlers.append(item.notify["action-group"].connect(() => {
                this.insert_action_group("dbusmenu", item.action_group);
            }));
            
            this.insert_action_group("dbusmenu", item.action_group);

            lc = new Gtk.GestureClick();
            lc.set_button(Gdk.BUTTON_PRIMARY);
            handlers.append(lc.pressed.connect(() => {
                item.activate(0, 0);
            }));
            this.add_controller(lc);

            rc = new Gtk.GestureClick();
            rc.set_button(Gdk.BUTTON_SECONDARY);
            handlers.append(rc.pressed.connect(() => {
                this.open_menu();
            }));
            this.add_controller(rc);

            this.destroy.connect(() => {
                foreach (var h in handlers) {
                    if (this.item != null) this.item.disconnect(h);
                }
                menu.unparent();
            });
        }

        public void open_menu() {
            if (this.item.menu_model != null) {
                item.about_to_show();
                menu.popup();
            }
        }
    }
}