import { Astal, Gtk, Gdk } from "ags/gtk4";
import systemMonitor from "../modules/SystemMonitor";
import systemTray from "../modules/SystemTray";
import media from "../modules/Media";
import app from "ags/gtk4/app";
import dateTime from "../modules/DateTime";
import network from "../modules/Network";
import hyprlandService from "../services/Hyprland";
import audioControl from "../modules/AudioControl";
import controlCenter from "../modules/ControlCenter";
import clients from "../modules/Clients";
import workspaces from "../modules/Workspaces";

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
        >
            <box cssClasses={["Bar"]} halign={Gtk.Align.FILL} homogeneous>
                <box halign={Gtk.Align.START}>
                    {systemTray.SystemTray}
                </box>
                <box halign={Gtk.Align.CENTER}>
                    {clients.ActiveClient}
                    {media.Media}
                    {workspaces.Workspaces({ monitor: hyprMonitor })}
                </box>
                <box halign={Gtk.Align.END}>
                    {dateTime.Time}
                    {audioControl.AudioControl}
                    {systemMonitor.SystemMonitor}
                    {controlCenter.ControlCenter(gdkmonitor)}
                </box>
            </box>
        </window>
    );
}
