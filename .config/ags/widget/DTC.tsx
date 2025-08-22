import { Astal, Gdk, Gtk } from "ags/gtk4"
import hyprlandService from "../services/Hyprland";
import dateTime from "../modules/DateTime";
import app from "ags/gtk4/app";

export default function DTC({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;
    const hyprMonitor = hyprlandService.getHyprlandMonitor(gdkmonitor);

    return (
        <window
            namespace='DTC'
            layer={Astal.Layer.BOTTOM}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT}
            visible={dateTime.shouldDTCAppear(hyprMonitor)}
            application={app}
        >
            <box halign={Gtk.Align.END} valign={Gtk.Align.START} children={dateTime.DateTimeCalendar} />
        </window>
    );
}
