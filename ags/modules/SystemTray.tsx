import { Accessor, createBinding, For, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import AstalTray from "gi://AstalTray?version=0.1";

export default class SystemTray {
    private static _instance: SystemTray;
    private default: AstalTray.Tray;
    private itemsBinding: Accessor<AstalTray.TrayItem[]>;

    private constructor() {
        this.default = AstalTray.get_default();
        this.itemsBinding = createBinding(this.default, "items");
    }

    private setupTrayItem = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
        btn.menuModel = item.menuModel;
        btn.insert_action_group("dbusmenu", item.actionGroup);

        const agId = item.connect("notify::action-group", () => {
            btn.insert_action_group("dbusmenu", item.actionGroup);
        });

        const mmId = item.connect("notify::menu-model", () => {
            btn.set_menu_model(item.menuModel);
        });

        onCleanup(() => {
            item.disconnect(agId);
            item.disconnect(mmId);
        });
    };

    private TrayItem({ item }: { item: AstalTray.TrayItem }) {
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

    public get SystemTray() {
        return (
            <box cssClasses={["SystemTray"]}>
                <For each={this.itemsBinding}>
                    {(item) => this.TrayItem({ item })}
                </For>
            </box>
        );
    }

    public static get instance() {
        if(!this._instance) {
            this._instance = new SystemTray;
        }
        return this._instance;
    }
}
