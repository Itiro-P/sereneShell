import { onCleanup } from "ags";
import { Astal, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app";

// WIP

export default function CavaOverlay({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { LEFT, RIGHT, BOTTOM, TOP } = Astal.WindowAnchor;

    return (
        <window
            namespace='Cheatsheet'
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            gdkmonitor={gdkmonitor}
            anchor={RIGHT | LEFT | BOTTOM | TOP}
            application={app}
            $={(self) => onCleanup(() => self.destroy())}
        >
        </window>
    );
}
