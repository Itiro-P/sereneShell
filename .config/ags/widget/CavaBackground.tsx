import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app";
import cava from "../modules/Cava";
import { createComputed, onCleanup } from "ags";
import media from "../modules/Media";

export default function CavaBackground({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

    return (
        <window
            name={'CavaBackground ' + gdkmonitor.get_connector()!}
    	    namespace='CavaBackground'
                layer={Astal.Layer.BACKGROUND}
                exclusivity={Astal.Exclusivity.IGNORE}
                gdkmonitor={gdkmonitor}
                anchor={RIGHT | LEFT | BOTTOM}
                visible={createComputed([media.playerStatus, cava.visibilityState], (ps, vs) => ps && vs)}
                application={app}
                $={self => onCleanup(() => self.destroy())}
            >
            <box valign={Gtk.Align.END} heightRequest={Math.floor(gdkmonitor.get_geometry().height * .25)}>
                {cava.Cava(["CavaBackground"])}
            </box>
        </window>
    );
}
