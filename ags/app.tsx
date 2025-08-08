import style from "./styles/index.scss";
import Bar from "./widget/Bar";
import app from "ags/gtk4/app";
import { createBinding, For, This } from "ags";
import CavaOverlay from "./widget/CavaOverlay";
import DTC from "./widget/DTC";
import { Gdk, Gtk } from "ags/gtk4";
import GObject from "gi://GObject?version=2.0";

interface Widget {
    bar: GObject.Object;
    cava: GObject.Object;
    dtc: GObject.Object;
}

function main() {
    const monitors = createBinding(app, "monitors");
    const widgetMap = new Map<Gdk.Monitor, Widget>();

    return (
        <For
            each={monitors}
            cleanup={
                (elem, monitor) => {
                    const widgets = widgetMap.get(monitor);
                    if(widgets) {
                        (widgets.bar as Gtk.Window).destroy();
                        (widgets.cava as Gtk.Window).destroy();
                        (widgets.dtc as Gtk.Window).destroy();
                        widgetMap.delete(monitor);
                    }
                }
            }
            children={monitor => {
                const bar = Bar({ gdkmonitor: monitor });
                const cavaOverlay = CavaOverlay({ gdkmonitor: monitor });
                const dtc = DTC({ gdkmonitor: monitor });
                widgetMap.set(monitor, { bar: bar, cava: cavaOverlay, dtc: dtc });
                return (
                    <This this={app}>
                        {bar}
                        {cavaOverlay}
                        {dtc}
                    </This>
                );
            }}
        />
    );
}


app.start({ css: style, main: main });
