import { Gdk, Gtk } from "ags/gtk4";
import settingsService from "../services/Settings";
import wallpaperSelector from "./WallpaperSelector";
import compositorManager from "../services/CompositorManager";

class ControlCenterClass {

    public constructor() {}

    public ControlCenter(gdkmonitor: Gdk.Monitor) {
        return (
            <menubutton
                cssClasses={["ControlCenter"]}
                popover={
                    <popover>
                        <box
                            cssClasses={["ControlCenterPopover"]}
                            orientation={Gtk.Orientation.VERTICAL}
                        >
                            <label
                                cssClasses={["Subtitle"]}
                                label={"Animations & Components"}
                            />
                            <box cssClasses={["ToggleAnimations", "Option"]}>
                                <label label={"Animations "} halign={Gtk.Align.START} />
                                <Gtk.Switch
                                    active={settingsService.animationsEnabled}
                                    onStateSet={(src, val) => {
                                        settingsService.setAnimationsEnabled = val;
                                        compositorManager.toggleAnimations(val);
                                    }}
                                />
                            </box>
                            <box cssClasses={["ToggleCava", "Option"]}>
                                <label label={"Cava "} halign={Gtk.Align.START} />
                                <Gtk.Switch
                                    active={settingsService.cavaVisible}
                                    onStateSet={(src, val) => settingsService.setCavaVisible = val}
                                />
                            </box>
                            {wallpaperSelector.SelectorIndicator(gdkmonitor)}
                        </box>
                    </popover> as Gtk.Popover
                }
            >
                <label cssClasses={["Label"]} label={"󰣇"} />
            </menubutton>
        );
    }
}

const controlCenter = new ControlCenterClass();

export default controlCenter;
