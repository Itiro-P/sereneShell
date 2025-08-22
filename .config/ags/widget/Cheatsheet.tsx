import { Astal, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app";

export default function CavaOverlay({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { LEFT, RIGHT, BOTTOM, TOP } = Astal.WindowAnchor;

    return (
        <window
            namespace='Cheatsheet'
            layer={Astal.Layer.OVERLAY}
            gdkmonitor={gdkmonitor}
            anchor={RIGHT | LEFT | BOTTOM | TOP}
            application={app}
        >
        </window>
    );
}
