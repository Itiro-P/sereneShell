import { Gtk, Gdk } from "astal/gtk4";
import Tray from "gi://AstalTray";
import { bind } from "astal";

const tray = Tray.get_default();

function TrayItem({ item }: { item: InstanceType<typeof Tray.TrayItem> }) {
    let handlers = {
        primary: 0,
        middle: 0,
        secondary: 0,
        menuModel: 0,
        actionG: 0
    };
    const clickPrimary = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
    const clickSecondary = new Gtk.GestureClick({ button: Gdk.BUTTON_SECONDARY });
    const clickMiddle = new Gtk.GestureClick({ button: Gdk.BUTTON_MIDDLE });

    return (
        <menubutton
            cssClasses={["TrayItem"]}
            tooltipText={ bind(item, "tooltipMarkup") }
            menuModel={ item.menuModel }
            direction={ Gtk.ArrowType.DOWN }
            setup={
                (self) => {
                        handlers = {
                            primary: clickPrimary.connect("pressed", (_self, _n, x, y) => { if(item.is_menu) self.get_popover()!.popup(); else item.activate(x, y); }),
                            middle: clickMiddle.connect("pressed", (_self, _n, x, y) => { item.secondary_activate(x, y); }),
                            secondary:  clickSecondary.connect("pressed", () => { item.about_to_show(); self.get_popover()!.popup(); }),
                            menuModel: item.connect("notify::menu-model", () => { self.set_menu_model(item.menuModel); }),
                            actionG: item.connect("notify::action-group", () => { self.insert_action_group("dbusmenu", item.actionGroup); })
                        };


                        self.add_controller(clickPrimary);
                        self.add_controller(clickMiddle);
                        self.add_controller(clickSecondary);
                    }
                }
            onDestroy={
                (self) => {
                    clickPrimary.disconnect(handlers.primary);
                    clickMiddle.disconnect(handlers.middle);
                    clickSecondary.disconnect(handlers.secondary);
                    item.disconnect(handlers.menuModel);
                    item.disconnect(handlers.actionG);
                }
            }
            child ={
                <image gicon={bind(item, "gicon")} pixelSize={16} />
            }
        />

    ) as Gtk.MenuButton;
}

export default function SystemTray() {
    return (
        <box cssClasses={["SystemTray"]} orientation={Gtk.Orientation.HORIZONTAL} spacing={4} marginEnd={8}>
            {bind(tray, "items").as(items => items.map(item => ( <TrayItem item={item}/>)))}
        </box>
    );
}
