import { Gtk } from "astal/gtk4";
import AstalTray from "gi://AstalTray?version=0.1";
import { bind } from "astal";

const tray = AstalTray.get_default();

function TrayItem({ item }: { item: InstanceType<typeof AstalTray.TrayItem> }) {
    const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
        btn.menuModel = item.menuModel;
        btn.insert_action_group("dbusmenu", item.actionGroup);

        item.connect("notify::action-group", () => {
            btn.insert_action_group("dbusmenu", item.actionGroup);
        });

        item.connect("notify::menu-model", () => {
            btn.set_menu_model(item.menuModel);
        });
    };

    return (
        <menubutton
            cssClasses={["TrayItem"]}
            tooltipMarkup={bind(item, "tooltipMarkup")}
            setup={(self) => init(self, item)}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            child={<image gicon={bind(item, "gicon")} pixelSize={16} />}
        />
    );
}

export default function SystemTray() {
    return (
        <box cssClasses={["SystemTray"]} spacing={4} marginEnd={8}>
            {bind(tray, "items").as(items => items.map(item => <TrayItem item={item} />))}
        </box>
    );
}
