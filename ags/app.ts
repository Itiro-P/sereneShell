import { Gdk, Gtk } from "ags/gtk4";
import style from "./styles/index.scss";
import Bar from "./widget/Bar";
import app from "ags/gtk4/app";
import { createBinding, For } from "ags";
import CavaOverlay from "./widget/CavaOverlay";
import DTC from "./widget/DTC";

function main() {
    const monitors = createBinding(app, "monitors");

    const bars = For({
        each: monitors,
        cleanup: (win: Gtk.Window) => win.destroy(),
        children: (monitor: Gdk.Monitor) => Bar({ gdkmonitor: monitor }) as Gtk.Window
    });

    const cavas = For({
        each: monitors,
        cleanup: (win: Gtk.Window) => win.destroy(),
        children: (monitor: Gdk.Monitor) => CavaOverlay({ gdkmonitor: monitor }) as Gtk.Window
    });

    const dtcs = For({
        each: monitors,
        cleanup: (win: Gtk.Window) => win.destroy(),
        children: (monitor: Gdk.Monitor) => DTC({ gdkmonitor: monitor }) as Gtk.Window
    });

    return [bars, cavas, dtcs];
}


app.start({
    css: style,
    main: main
});
