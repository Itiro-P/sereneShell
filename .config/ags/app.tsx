import style from "./styles/index.scss";
import app from "ags/gtk4/app";
import { createBinding, For, This } from "ags";
import { Bar, CavaBackground } from "./widgets";
import { execAsync } from "ags/process";
import GLib from "gi://GLib?version=2.0";

const path = GLib.get_home_dir() + "/.config/ags/styles";

function requestHandler(argv: string[], response: (response: string) => void) {
    const [cmd, arg, ...rest] = argv
    switch(cmd) {
        case "css-reset":
            execAsync(`sass ${path}/index.scss ${path}/output.css`).then(
                () => {
                    app.apply_css(`${path}/output.css`, true);
                    response("CSS reset successful");
                },
                (reason) => {
                    response("CSS reset failed :" + reason);
                }
            );
            break;
        default:
            response("Unknown command");
    }
}

function main() {
    const monitors = createBinding(app, "monitors");
    return (
        <For each={monitors}>
            {monitor =>
                <This this={app}>
                    <Bar gdkmonitor={monitor} />
                    <CavaBackground gdkmonitor={monitor} />
                </This>
            }
        </For>
    );
}

app.start({ css: style, main: main, requestHandler: requestHandler });
