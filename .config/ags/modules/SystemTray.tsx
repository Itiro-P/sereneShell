import { Accessor, createBinding, For, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import AstalTray from "gi://AstalTray?version=0.1";

class SystemTrayClass {
    private default: AstalTray.Tray;
    private itemsBinding: Accessor<AstalTray.TrayItem[]>;

    public constructor() {
        this.default = AstalTray.get_default();
        this.itemsBinding = createBinding(this.default, "items");
    }

    private setupTrayItem = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
        btn.menuModel = item.menuModel;
        btn.insert_action_group("dbusmenu", item.actionGroup);

        const agId = item.connect("notify::action-group", () => btn.insert_action_group("dbusmenu", item.actionGroup));

        const mmId = item.connect("notify::menu-model", () => btn.set_menu_model(item.menuModel));

        onCleanup(() => {
            item.disconnect(agId);
            item.disconnect(mmId);
        });
    };

    private TrayItem(item: AstalTray.TrayItem) {
        return (
            <menubutton
                cssClasses={["TrayItem"]}
                tooltipMarkup={createBinding(item, "tooltipMarkup")}
                $={(self) => this.setupTrayItem(self, item)}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            >
                <image gicon={createBinding(item, "gicon")} />
            </menubutton>
        );
    }

    public SystemTray = () => {
        return (
            <box cssClasses={["SystemTray"]}>
                <For each={this.itemsBinding} children={item => this.TrayItem(item)} />
            </box>
        );
    }
}

const systemTray = new SystemTrayClass;

export default systemTray;
