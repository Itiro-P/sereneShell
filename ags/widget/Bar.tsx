import { Astal, Gtk, Gdk } from "ags/gtk4";
import SystemMonitor from "../modules/SystemMonitor";
import AudioControl from "../modules/AudioControl";
import SystemTray from "../modules/SystemTray";
import { MiniTime } from "../modules/DateTime";
import Media from "../modules/Media";
import Workspaces from "../modules/Workspaces";
import Clients from "../modules/Clients";
import app from "ags/gtk4/app";
import ControlCenter from "../modules/ControlCenter";

export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

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
                    <SystemTray />
                </box>
                <box halign={Gtk.Align.CENTER}>
                    <Clients />
                    <Media />
                    <Workspaces monitor={gdkmonitor} />
                </box>
                <box halign={Gtk.Align.END}>
                    <MiniTime />
                    <AudioControl />
                    <SystemMonitor />
                    <ControlCenter />
                </box>
            </box>
        </window>
    );
}
