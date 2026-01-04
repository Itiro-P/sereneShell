import { Astal, Gdk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { AudioControl, DateTime, ControlMenu, Workspaces, Media, SystemTray, SystemMonitor } from "../modules";
import { onCleanup, With } from "ags";
import { compositorService } from "../services";

export function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
    const monitor = compositorService.getCompositorMonitor(gdkmonitor);

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
                    <SystemTray.SystemTray />
                </box>
                <box $type="center">
                    <With value={monitor}>
                        {out => out && <Workspaces.Workspaces monitor={out} />}
                    </With>
                </box>
                <box $type="end">
                    <Media.MediaMinimal />
                    <DateTime.Clock />
                    <SystemMonitor.SystemMonitor />
                    <AudioControl.AudioControl />
                    <ControlMenu.ControlMenuButton gdkmonitor={gdkmonitor} />
                </box>
            </centerbox>
        </window>
    );
}
