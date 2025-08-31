import { Astal, Gtk, Gdk } from "ags/gtk4";
import systemMonitor from "../modules/SystemMonitor";
import systemTray from "../modules/SystemTray";
import media from "../modules/Media";
import app from "ags/gtk4/app";
import dateTime from "../modules/DateTime";
import hyprlandService from "../services/Hyprland";
import audioControl from "../modules/AudioControl";
import controlCenter from "../modules/ControlCenter";
import workspaces from "../modules/Workspaces";
import { onCleanup } from "ags";

export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
    const hyprMonitor = hyprlandService.getHyprlandMonitor(gdkmonitor);

    return (
        <window
            namespace='Bar'
            cssClasses={["Bar"]}
            visible
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            layer={Astal.Layer.BOTTOM}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT | LEFT}
            application={app}
            $={(self) => onCleanup(() => self.destroy())}
        >
            <box cssClasses={["Bar"]} halign={Gtk.Align.FILL} homogeneous>
                <box halign={Gtk.Align.START}>
                    {systemTray.SystemTray}
                </box>
                <box halign={Gtk.Align.CENTER}>
                    {media.Media}
                    {workspaces.Workspaces({ monitor: hyprMonitor })}
                </box>
                <box halign={Gtk.Align.END}>
                    {dateTime.DateTime}
                    {audioControl.AudioControl}
                    {systemMonitor.SystemMonitor}
                    {controlCenter.ControlCenter(gdkmonitor)}
                </box>
            </box>
        </window>
    );
}
