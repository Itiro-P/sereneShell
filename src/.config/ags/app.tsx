import style from "./styles/index.scss";
import app from "ags/gtk4/app";
import { createBinding, For, This } from "ags";
import { Bar, CavaBackground } from "./widgets";
import { iconFinderService, settingsService } from "./services";
import { Gdk } from "ags/gtk4";

function main() {
    app.connect("shutdown", () => {
        settingsService.saveOptions();
        iconFinderService.saveIconNames();
    });

    return (
        <For each={createBinding(app, "monitors")}>
            {(monitor: Gdk.Monitor) =>
                <This this={app}>
                    <Bar gdkmonitor={monitor} />
                    <CavaBackground gdkmonitor={monitor} />
                </This>
            }
        </For>
    );
}

app.start({ css: style, main: main });
