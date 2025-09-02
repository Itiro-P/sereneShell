import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import settingsService from "../services/Settings";
import wallpaperSelector from "./WallpaperSelector";
import compositorManager from "../services/CompositorManager";

class ControlCenterClass {
    public constructor() {
    }

    private get ToggleVisibleComponents() {
        onCleanup(() => settingsService.saveOptions());
        return (
            <box cssClasses={["ToggleVisibleComponents"]} orientation={Gtk.Orientation.VERTICAL}>
                <label cssClasses={["Subtitle"]} label={'Animations & Components'} />
                <box cssClasses={["ToggleAnimations", "Option"]}>
                    <label label={"Animations "} halign={Gtk.Align.START} />
                    <Gtk.Switch
                        active={settingsService.animationsEnabled}
                        onStateSet={
                            (src, val) => {
                                settingsService.setAnimationsEnabled = val;
                                compositorManager.toggleAnimations(val);
                            }
                        }
                    />
                </box>
                <box cssClasses={["ToggleCava", "Option"]}>
                    <label label={"Cava "} halign={Gtk.Align.START} />
                    <Gtk.Switch active={settingsService.cavaVisible} onStateSet={(src, val) => settingsService.setCavaVisible = val} />
                </box>
            </box>
        );
    }

    private ControlCenterPopover(gdkmonitor: Gdk.Monitor) {
        return (
            <popover onClosed={() => settingsService.saveOptions()}>
                <box cssClasses={["ControlCenterPopover"]}>
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        {this.ToggleVisibleComponents}
                        {wallpaperSelector.SelectorIndicator(gdkmonitor)}
                    </box>
                </box>
            </popover>
        );
    }

    public ControlCenter(gdkmonitor: Gdk.Monitor) {
        return (
            <menubutton cssClasses={["ControlCenter"]} popover={this.ControlCenterPopover(gdkmonitor) as Gtk.Popover}>
                <label cssClasses={['Label']} label={'󰣇'} />
            </menubutton>
        );
    }
}

const controlCenter = new ControlCenterClass;

export default controlCenter;
