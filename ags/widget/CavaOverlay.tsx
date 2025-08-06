import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app";
import Cava from "../modules/Cava";
import { onCleanup } from "ags";
import Hyprland from "../services/Hyprland";

export default function CavaOverlay({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

    return (
        <window
            namespace='CavaOverlay'
            layer={Astal.Layer.BOTTOM}
            gdkmonitor={gdkmonitor}
            anchor={RIGHT | LEFT | BOTTOM}
            visible={Cava.instance.shouldCavaAppear(Hyprland.instance.getHyprlandMonitor(gdkmonitor))}
            application={app}
            $={self => onCleanup(() => self.destroy())}
        >
            <box halign={Gtk.Align.FILL} valign={Gtk.Align.END} heightRequest={Math.floor(gdkmonitor.get_geometry().height * .25)}>
                {Cava.instance.Cava(["CavaOverlay"])}
            </box>
        </window>
    );
}
