import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import settingsService from "../services/Settings";
import wallpaperSelector from "./WallpaperSelector";

class ControlCenterClass {
    public constructor() {
    }

    private setupButton(self: Gtk.Widget, callback: () => void) {
        const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
        const handler = click.connect('pressed', callback);
        self.add_controller(click);
        onCleanup(() => click.disconnect(handler));
    }

    private formatCavaVisiblityText(i: boolean) {
        if(i) return 'Cava sempre ativo';
        return 'Cava desativado';
    }

    private get ToggleVisibleComponents() {
        onCleanup(() => settingsService.saveOptions());
        return (
            <box cssClasses={["ToggleVisibleComponents"]} orientation={Gtk.Orientation.VERTICAL}>
                <label cssClasses={["Subtitle"]} label={'Animações e componentes'} />
                <label
                    cssClasses={["ToggleAnimations", "Option"]}
                    $={self => this.setupButton(self, () => settingsService.setAnimationsEnabled = !settingsService.animationsEnabled.get())}
                    label={settingsService.animationsEnabled.as(ae => ae ? "Desativar animações" : "Ativar animações")}
                    widthChars={30}
                />
                <label
                    cssClasses={["ToggleCava", "Option"]}
                    $={self => this.setupButton(self, () => settingsService.setCavaVisible = !settingsService.cavaVisible.get())}
                    label={settingsService.cavaVisible.as(vs => this.formatCavaVisiblityText(vs))}
                    widthChars={30}
                />
            </box>
        );
    }

    private ControlCenterPopover(gdkmonitor: Gdk.Monitor) {
        return (
            <popover>
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
