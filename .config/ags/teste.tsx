import style from "./styles/index.scss";
import app from "ags/gtk4/app";
import { createBinding, For, This } from "ags";
import AstalNiri from "gi://AstalNiri?version=0.1";

function main() {
    const monitors = createBinding(app, "monitors");
    const niri = AstalNiri.get_default();
    const test = createBinding(niri, "focusedOutput")((fo) => fo.get_name());
    return (
        <For each={monitors}>
            {(monitor) => (
                <This this={app}>
                    <label label={test} />
                </This>
            )}
        </For>
    );
}

app.start({ css: style, main: main });
