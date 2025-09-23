import style from "./styles/index.scss";
import app from "ags/gtk4/app";
import { createBinding, For, onCleanup, This } from "ags";
import Bar from "./widget/Bar";
import CavaOverlay from "./widget/CavaOverlay";
import Cheatsheet from "./widget/Cheatsheet";
import settingsService from "./services/Settings";
import iconFinder from "./services/IconFinder";
import controlMenu from "./modules/ControlMenu";

function main() {
    onCleanup(() => {
        settingsService.saveOptions();
        iconFinder.saveIconNames();
    });
    const monitors = createBinding(app, "monitors");
    return (
        <For each={monitors}>
            {monitor => {
                return (
                    <This this={app}>
                        <Bar gdkmonitor={monitor} />
                        <CavaOverlay gdkmonitor={monitor} />
                        <Cheatsheet gdkmonitor={monitor} />
                        {controlMenu.ControlMenu(monitor)}
                    </This>
                );
            }}
        </For>
    );
}

app.start({ css: style, main: main });
