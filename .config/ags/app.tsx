import style from "./styles/index.scss";
import app from "ags/gtk4/app";
import { createBinding, For, onCleanup, This } from "ags";
import Bar from "./widget/Bar";
import CavaOverlay from "./widget/CavaOverlay";
import Cheatsheet from "./widget/Cheatsheet";
import settingsService from "./services/Settings";
import iconFinder from "./services/IconFinder";
import controlMenu from "./modules/ControlMenu";
import wallpaperSwitcher from "./modules/WallpaperSwitcher";

function main() {
    const monitors = createBinding(app, "monitors");
    onCleanup(() => {
        settingsService.saveOptions();
        iconFinder.saveIconNames();
    });
    return (
        <For each={monitors}>
            {monitor => {
                return (
                    <This this={app}>
                        <Bar gdkmonitor={monitor} />
                        <CavaOverlay gdkmonitor={monitor} />
                        <Cheatsheet gdkmonitor={monitor} />
                        {wallpaperSwitcher.WallpaperSwitcher(monitor)}
                        {controlMenu.ControlMenu(monitor)}
                    </This>
                );
            }}
        </For>
    );
}

app.start({ css: style, main: main });
