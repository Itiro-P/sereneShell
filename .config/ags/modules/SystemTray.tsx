import { Accessor, createBinding, For, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import AstalTray from "gi://AstalTray?version=0.1";
import { trayService } from "../services/Tray";

export namespace SystemTray {
    function setupTrayItem (btn: Gtk.MenuButton, item: AstalTray.TrayItem) {
        btn.menuModel = item.menuModel;
        btn.insert_action_group("dbusmenu", item.actionGroup);

        const agId = item.connect("notify::action-group", () => btn.insert_action_group("dbusmenu", item.actionGroup));

        const mmId = item.connect("notify::menu-model", () => btn.set_menu_model(item.menuModel));

        onCleanup(() => {
            item.disconnect(agId);
            item.disconnect(mmId);
        });
    };

    function TrayItem({ item }: { item: AstalTray.TrayItem }) {
        return (
            <menubutton
                cssClasses={["TrayItem"]}
                tooltipMarkup={createBinding(item, "tooltipMarkup")}
                $={(self) => setupTrayItem(self, item)}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            >
                <image gicon={createBinding(item, "gicon")} />
            </menubutton>
        );
    }

    export function SystemTray() {
        return (
            <box cssClasses={["SystemTray"]}>
                <For each={trayService.items} children={item => <TrayItem item={item} />} />
            </box>
        );
    }
}
