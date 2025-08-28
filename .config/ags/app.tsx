import style from "./styles/index.scss";
import Bar from "./widget/Bar";
import app from "ags/gtk4/app";
import { createBinding, For, This } from "ags";
import CavaOverlay from "./widget/CavaOverlay";
import DTC from "./widget/DTC";
import { Gtk } from "ags/gtk4";
import GObject from "gi://GObject?version=2.0";
import Cheatsheet from "./widget/Cheatsheet";

function main() {
    const monitors = createBinding(app, "monitors");
    return (
        <For each={monitors}>
            {monitor => (
                <This this={app}>
                    <Bar gdkmonitor={monitor} />
                    <CavaOverlay gdkmonitor={monitor} />
                    <DTC gdkmonitor={monitor} />
                    <Cheatsheet gdkmonitor={monitor} />
                </This>
            )}
        </For>
    );
}

app.start({ css: style, main: main });
