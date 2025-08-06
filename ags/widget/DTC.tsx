import { Astal, Gdk, Gtk } from "ags/gtk4"
import Hyprland from "../services/Hyprland";
import DateTime from "../modules/DateTime";
import app from "ags/gtk4/app";
import { onCleanup } from "ags";

export default function DTC({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

    return (
        <window
            namespace='DTC'
            layer={Astal.Layer.BOTTOM}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT}
            visible={DateTime.instance.shouldDTCAppear(Hyprland.instance.getHyprlandMonitor(gdkmonitor))}
            application={app}
            $={self => onCleanup(() => self.destroy())}
        >
            <box halign={Gtk.Align.END} valign={Gtk.Align.START} children={DateTime.instance.DateTimeCalendar} />
        </window>
    );
}
