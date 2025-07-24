import { Astal, Gtk, Gdk } from "ags/gtk4";
import SystemMonitor from "../modules/SystemMonitor";
import AudioControl from "../modules/AudioControl";
import SystemTray from "../modules/SystemTray";
import Media from "../modules/Media";
import Workspaces from "../modules/Workspaces";
import Clients from "../modules/Clients";
import app from "ags/gtk4/app";
import ControlCenter from "../modules/ControlCenter";
import DateTime from "../modules/DateTime";

export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

    return (
        <window
            namespace='AstalBar'
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
                    {SystemTray.instance.SystemTray}
                </box>
                <box halign={Gtk.Align.CENTER}>
                    {Clients.instance.Clients}
                    {Media.instance.Media}
                    {Workspaces.instance.Workspaces({ monitor: gdkmonitor })}
                </box>
                <box halign={Gtk.Align.END}>
                    {DateTime.instance.Time}
                    {AudioControl.instance.AudioControl}
                    {SystemMonitor.instance.SystemMonitor}
                    {ControlCenter.instance.ControlCenter}
                </box>
            </box>
        </window>
    );
}
