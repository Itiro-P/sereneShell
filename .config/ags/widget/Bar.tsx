import { Astal, Gdk } from "ags/gtk4";
import systemTray from "../modules/SystemTray";
import app from "ags/gtk4/app";
import dateTime from "../modules/DateTime";
import audioControl from "../modules/AudioControl";
import controlMenu from "../modules/ControlMenu";
import workspaces from "../modules/Workspaces";
import { onCleanup, With } from "ags";
import media from "../modules/Media";
import { compositorManager } from "../services";

export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
    const monitor = compositorManager.getCompositorMonitor(gdkmonitor);

    return (
        <window
            name={'Bar ' + gdkmonitor.get_connector()}
            namespace='Bar'
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
                    <systemTray.SystemTray />
                </box>
                <box $type="center">
                    <With value={monitor}>
                        {out => out && workspaces.Workspaces(out)}
                    </With>
                </box>
                <box $type="end">
                    <media.MediaMinimal />
                    <dateTime.DateTime />
                    <audioControl.AudioControl />
                    <controlMenu.ControlMenuButton gdkmonitor={gdkmonitor} />
                </box>
            </centerbox>
        </window>
    );
}
