import style from "./styles/index.scss";
import Bar from "./widget/Bar";
import app from "ags/gtk4/app";
import { createBinding, For, This } from "ags";
import CavaOverlay from "./widget/CavaOverlay";
import DTC from "./widget/DTC";
import { Gtk } from "ags/gtk4";

function main() {
    const monitors = createBinding(app, "monitors");

    const bars = <For each={monitors} children={monitor => Bar({ gdkmonitor: monitor })} cleanup={obj => (obj as Gtk.Window).destroy()} />
    const cavaOverlays = <For each={monitors} children={monitor => CavaOverlay({ gdkmonitor: monitor })} cleanup={obj => (obj as Gtk.Window).destroy()} />
    const dtcs = <For each={monitors} children={monitor => DTC({ gdkmonitor: monitor })} cleanup={obj => (obj as Gtk.Window).destroy()} />

    return [bars, cavaOverlays, dtcs];
}


app.start({ css: style, main: main });
