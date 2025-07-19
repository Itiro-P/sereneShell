import { App, Astal, Gdk, Gtk } from "astal/gtk4"
import { DateTime } from "../modules/DateTime";
import { bind } from "astal";
import { CavaOverlay } from "../modules/Cava";
import { hasAnyClient } from "../services/Hyprland";

export default function Background(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

    return (
        <window
            namespace='AstalBackground'
            cssClasses={["Background"]}
            layer={Astal.Layer.BACKGROUND}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT | LEFT | BOTTOM}
            application={App}
            visible={bind(hasAnyClient)}
            child={
                <overlay
                    setup={(self) => {
                        self.set_child(<box halign={Gtk.Align.END} valign={Gtk.Align.START} child={<DateTime />} />);
                        self.add_overlay(<box halign={Gtk.Align.FILL} valign={Gtk.Align.END} heightRequest={Math.floor(gdkmonitor.get_geometry().height * .25)} child={<CavaOverlay />} />);
                    }}
                />
            }
        >
        </window>
    );
}
