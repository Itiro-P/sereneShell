import { Gdk, Gtk } from "ags/gtk4";
import { Astal } from "ags/gtk4";
import { onCleanup } from "ags";
import app from "ags/gtk4/app";
import systemMonitor from "./SystemMonitor";
import settingsService from "../services/Settings";
import wallpaperSelector from "./WallpaperSelector";
import audioControl from "./AudioControl";

class ControlMenuClass {

    public constructor() {}

    public ControlMenu(gdkmonitor: Gdk.Monitor) {
        return (
            <window
                name={'ControlMenu ' + gdkmonitor.get_connector()}
                namespace='ControlMenu'
                layer={Astal.Layer.OVERLAY}
                anchor={ Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP }
                gdkmonitor={gdkmonitor}
                keymode={Astal.Keymode.ON_DEMAND}
                application={app}
                $={self => onCleanup(() => self.destroy())}
            >
                <Gtk.EventControllerKey onKeyPressed={({ widget }, keyval: number) => {
                    switch(keyval) {
                        case Gdk.KEY_Escape:
                            widget.hide();
                            break;
                        default:
                    }}}
                />
                <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["ControlMenu"]}>
                    <label cssClasses={["Title"]} label={'Control Menu'} />
                    {systemMonitor.SystemMonitor}
                    {audioControl.Mixer}
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        <label
                            cssClasses={["Subtitle"]}
                            label={"Animations & Components"}
                        />
                        <box cssClasses={["ToggleAnimations", "Option"]}>
                            <label label={"Animations "} halign={Gtk.Align.START} />
                            <switch
                                active={settingsService.animationsEnabled}
                                onStateSet={(src, val) => settingsService.setAnimationsEnabled = val}
                            />
                        </box>
                        <box cssClasses={["ToggleCava", "Option"]}>
                            <label label={"Cava "} halign={Gtk.Align.START} />
                            <switch
                                active={settingsService.cavaVisible}
                                onStateSet={(src, val) => settingsService.setCavaVisible = val}
                            />
                        </box>
                        {wallpaperSelector.SelectorIndicator(gdkmonitor)}
                    </box>
                </box>
            </window>
        );
    }

    public ControlMenuButton(connector: string) {
        return (
            <button cssClasses={systemMonitor.BatteryCritical(bc => ["ControlMenuButton", bc ? "ControlMenuButtonCritical" : "ControlMenuButtonNormal"])} label={"󰣇"} onClicked={() => app.toggle_window(`ControlMenu ${connector}`)} />
        );
    }
}

const controlMenu = new ControlMenuClass();

export default controlMenu;
