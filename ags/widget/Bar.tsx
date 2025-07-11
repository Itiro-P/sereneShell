import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import SystemMonitor from "../modules/SystemMonitor";
import AudioControl from "../modules/AudioControl";
import SystemTray from "../modules/SystemTray";
import { MiniTime } from "../modules/DateTime";
import Media from "../modules/Media";
import Workspaces from "../modules/Workspaces";
import Clients from "../modules/Clients";

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return (
        <window
            namespace='AstalBar'
            cssClasses={["Bar"]}
            visible
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | RIGHT | LEFT}
            application={App}
            child={
                <box cssClasses={["Bar"]} halign={Gtk.Align.FILL} homogeneous>
                    <box halign={Gtk.Align.START}>
                        <SystemTray />
                    </box>
                    <box halign={Gtk.Align.CENTER}>
                        <Clients />
                        <Media />
                        <Workspaces />
                    </box>
                    <box halign={Gtk.Align.END}>
                        <MiniTime />
                        <AudioControl />
                        <SystemMonitor />
                    </box>
                </box>
            }
        />
    );
}
