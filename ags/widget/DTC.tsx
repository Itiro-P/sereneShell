import { Astal, Gdk, Gtk } from "ags/gtk4"
import Hyprland from "../services/Hyprland";
import DateTime from "../modules/DateTime";
import app from "ags/gtk4/app";

export default function DTC({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;
    const hyprMonitor = Hyprland.instance.getHyprlandMonitor(gdkmonitor);

    return (
        <window
            namespace='DTC'
            layer={Astal.Layer.BOTTOM}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT}
            visible={DateTime.instance.shouldDTCAppear(hyprMonitor)}
            application={app}
        >
            <box halign={Gtk.Align.END} valign={Gtk.Align.START} children={DateTime.instance.DateTimeCalendar} />
        </window>
    );
}
