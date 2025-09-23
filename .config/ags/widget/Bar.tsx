import { Astal, Gtk, Gdk } from "ags/gtk4";
import systemTray from "../modules/SystemTray";
import media from "../modules/Media";
import app from "ags/gtk4/app";
import dateTime from "../modules/DateTime";
import audioControl from "../modules/AudioControl";
import controlMenu from "../modules/ControlMenu";
import workspaces from "../modules/Workspaces";
import { onCleanup } from "ags";
import compositorManager from "../services/CompositorManager";

export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
    const compMonitor = compositorManager.getCompositorMonitor(gdkmonitor);

    return (
        <window
            name='Bar'
            namespace='Bar'
            cssClasses={["Bar"]}
            visible
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            layer={Astal.Layer.BOTTOM}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT | LEFT}
            application={app}
            $={self => onCleanup(() => self.destroy())}
        >
            <centerbox cssClasses={["Bar"]}>
                <box $type="start">
                    {systemTray.SystemTray}
                </box>
                <box $type="center">
                    {compMonitor ? workspaces.Workspaces(compMonitor) : <box/>}
                </box>
                <box $type="end">
                    {media.Media}
                    {dateTime.DateTime}
                    {audioControl.AudioControl}
                    {controlMenu.ControlMenuButton(gdkmonitor.get_connector()!)}
                </box>
            </centerbox>
        </window>
    );
}
