import style from "./styles/index.scss";
import app from "ags/gtk4/app";
import { createBinding, For, This } from "ags";
import Bar from "./widget/Bar";
import CavaOverlay from "./widget/CavaOverlay";
import Cheatsheet from "./widget/Cheatsheet";

function main() {
    const monitors = createBinding(app, "monitors");

    return (
        <For each={monitors}>
            {monitor => (
                <This this={app}>
                    <Bar gdkmonitor={monitor} />
                    <CavaOverlay gdkmonitor={monitor} />
                    <Cheatsheet gdkmonitor={monitor} />
                </This>
            )}
        </For>
    );
}

app.start({ css: style, main: main });
