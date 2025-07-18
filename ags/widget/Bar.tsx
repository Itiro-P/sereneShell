import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import SystemMonitor from "../modules/SystemMonitor";
import AudioControl from "../modules/AudioControl";
import SystemTray from "../modules/SystemTray";
import { MiniTime } from "../modules/DateTime";
import Media from "../modules/Media";
import Workspaces from "../modules/Workspaces";
import Clients from "../modules/Clients";

const systemTray = SystemTray();
const clients = Clients();
const media = Media();
const miniTime = MiniTime();
const audioControl = AudioControl();
const systemMonitor = SystemMonitor();

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return (
        <window
            namespace='AstalBar'
            cssClasses={["Bar"]}
            visible
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            layer={Astal.Layer.BACKGROUND}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT | LEFT}
            application={App}
            child={
                <box cssClasses={["Bar"]} halign={Gtk.Align.FILL} homogeneous>
                    <box halign={Gtk.Align.START}>
                        {systemTray}
                    </box>
                    <box halign={Gtk.Align.CENTER}>
                        {clients}
                        {media}
                        <Workspaces monitor={gdkmonitor} />
                    </box>
                    <box halign={Gtk.Align.END}>
                        {miniTime}
                        {audioControl}
                        {systemMonitor}
                    </box>
                </box>
            }
        />
    );
}
