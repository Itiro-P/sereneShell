import { App, Astal, Gdk } from "astal/gtk4"
import { cavaOnBackground, CavaOverlay } from "../modules/Cava";
import { bind } from "astal";

const cava = CavaOverlay();

export default function CavaBackground(gdkmonitor: Gdk.Monitor) {
    const { LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

    return (
        <window
            namespace='AstalCavaBackground'
            cssClasses={["CavaBackground"]}
            layer={Astal.Layer.BACKGROUND}
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.IGNORE}
            anchor={ RIGHT | LEFT | BOTTOM}
            application={App}
            heightRequest={gdkmonitor.get_height_mm() * 2}
            visible={bind(cavaOnBackground).as(cob => cob)}
            child={cava}
        />
    );
}
