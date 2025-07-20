import { createBinding, For, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import AstalTray from "gi://AstalTray?version=0.1";

const tray = AstalTray.get_default();

function TrayItem({ item }: { item: AstalTray.TrayItem }) {
    const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
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

    return (
        <menubutton
            cssClasses={["TrayItem"]}
            tooltipMarkup={createBinding(item, "tooltipMarkup")}
            $={(self) => init(self, item)}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
        >
            <image gicon={createBinding(item, "gicon")} />
        </menubutton>
    );
}

export default function SystemTray() {
    const items = createBinding(tray, "items");
    return (
        <box cssClasses={["SystemTray"]}>
            <For each={items}>
                {(item) => <TrayItem item={item} />}
            </For>
        </box>
    );
}
