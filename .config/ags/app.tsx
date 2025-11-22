import style from "./styles/index.scss";
import app from "ags/gtk4/app";
import { createBinding, For, onCleanup, This } from "ags";
import Bar from "./widget/Bar";
import CavaBackground from "./widget/CavaBackground";
import settingsService from "./services/Settings";
import iconFinder from "./services/IconFinder";
import controlMenu from "./modules/ControlMenu";
import wallpaperSwitcher from "./modules/WallpaperSwitcher";
import { exec } from "ags/process";
import GLib from "gi://GLib?version=2.0";

const path = GLib.get_home_dir() + "/.config/ags/styles";

function requestHandler(argv: string[], response: (response: string) => void) {
    const [cmd, arg, ...rest] = argv
    switch(cmd) {
        case "css-reset":
            exec(`sass ${path}/index.scss ${path}/output.css`);
            app.apply_css(`${path}/output.css`, true);
            response("CSS reset successful");
            break;
        default:
            response("Unknown command");
    }
}

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
                        {<CavaBackground gdkmonitor={monitor} />}
                        {wallpaperSwitcher.WallpaperSwitcher(monitor)}
                        {controlMenu.ControlMenu(monitor)}
                    </This>
                );
            }}
        </For>
    );
}

app.start({ css: style, main: main, requestHandler: requestHandler });
