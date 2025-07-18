import { App, Astal, Gdk, Gtk } from "astal/gtk4"
import { DateTime } from "../modules/DateTime";
import { bind, Variable } from "astal";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { CavaOverlay } from "../modules/Cava";

const clientFocused = Variable.derive([bind(AstalHyprland.get_default(), "focusedClient")], (fc) => !fc);

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
            visible={bind(clientFocused)}
            child={
                <overlay
                    setup={(self) => {
                        self.set_child(<box halign={Gtk.Align.END} valign={Gtk.Align.START} child={<DateTime />} />);
                        self.add_overlay(<box halign={Gtk.Align.FILL} valign={Gtk.Align.END} heightRequest={Math.floor(gdkmonitor.get_geometry().height * .4)} child={<CavaOverlay />} />);
                    }}
                />
            }
        >
        </window>
    );
}
