import { Gdk, Gtk } from "ags/gtk4";
import style from "./styles/index.scss";
import Bar from "./widget/Bar";
import Background from "./widget/Background";
import app from "ags/gtk4/app";
import { createBinding, For, jsx } from "ags";

function main() {
    const monitors = createBinding(app, "monitors");

    const bars = For({
        each: monitors,
        cleanup: (win: Gtk.Window) => win.destroy(),
        children: (monitor: Gdk.Monitor) => Bar({ gdkmonitor: monitor }) as Gtk.Window
    });

    const backgrounds = For({
        each: monitors,
        cleanup: (win: Gtk.Window) => win.destroy(),
        children: (monitor: Gdk.Monitor) => Background({ gdkmonitor: monitor }) as Gtk.Window
    });

    return [bars, backgrounds];
}


app.start({
    css: style,
    main: main
});
