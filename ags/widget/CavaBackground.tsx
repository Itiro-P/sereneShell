import { App, Astal, Gdk } from "astal/gtk4"
import { cavaOnBackground, CavaOverlay } from "../modules/Cava";
import { bind } from "astal";

export default function CavaBackground(gdkmonitor: Gdk.Monitor) {
    const { LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;
    const cava = CavaOverlay();
    cava.heightRequest = gdkmonitor.get_height_mm() * 2;

    return (
        <window
            namespace='AstalCavaBackground'
            cssClasses={["CavaBackground"]}
            layer={Astal.Layer.BACKGROUND}
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.IGNORE}
            anchor={ RIGHT | LEFT | BOTTOM}
            application={App}
            visible={bind(cavaOnBackground).as(cob => cob)}
            child={cava}
        />
    );
}
