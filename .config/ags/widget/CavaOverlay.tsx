import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app";
import cava from "../modules/Cava";
import { onCleanup } from "ags";

export default function CavaOverlay({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

    return (
        <window
            name='CavaOverlay'
            layer={Astal.Layer.BOTTOM}
            gdkmonitor={gdkmonitor}
            anchor={RIGHT | LEFT | BOTTOM}
            visible={cava.visibilityState}
            application={app}
            $={(self) => onCleanup(() => self.destroy())}
        >
            <box halign={Gtk.Align.FILL} valign={Gtk.Align.END} heightRequest={Math.floor(gdkmonitor.get_geometry().height * .25)}>
                {cava.Cava(["CavaOverlay"])}
            </box>
        </window>
    );
}
