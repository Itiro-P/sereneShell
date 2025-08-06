import { Gdk, Gtk } from "ags/gtk4";
import { animationsEnabled, toggleAnimations } from "../services/Animations";
import { onCleanup } from "ags";
import DateTime from "./DateTime";
import Cava, { CavaVisiblity } from "./Cava";
import WallpaperSelector from "./WallpaperSelector";
import Bluetooth from "./Bluetooth";
import Network from "./Network";

export default class ControlCenter {
    private static _instance: ControlCenter;

    private constructor() {

    }

    public static get instance() {
        if(!this._instance) {
            this._instance = new ControlCenter;
        }
        return this._instance;
    }

    private setupButton(self: Gtk.Widget, callback: () => void) {
        const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
        const handler = click.connect('pressed', callback);
        self.add_controller(click);
        onCleanup(() => click.disconnect(handler));
    }

    private formatCavaVisiblityText(i: CavaVisiblity) {
        switch(i) {
            case CavaVisiblity.ALWAYS:
                return 'Cava sempre ativo';
            case CavaVisiblity.DISABLED:
                return 'Cava desativado'
            case CavaVisiblity.NO_CLIENTS:
                return 'Cava condicional'
        }
    }

    private get ToggleVisibleComponents() {
        return (
            <box cssClasses={["ToggleVisibleComponents"]} orientation={Gtk.Orientation.VERTICAL}>
                <label cssClasses={["Subtitle"]} label={'Animações e componentes'} />
                <label
                    cssClasses={["ToggleAnimations", "Option"]}
                    $={self => this.setupButton(self, () => toggleAnimations())}
                    label={animationsEnabled.as(ae => ae ? "Desativar animações" : "Ativar animações")}
                    widthChars={30}
                />
                <label
                    cssClasses={["ToggleDateTimeCalendar", "Option"]}
                    $={self => this.setupButton(self, () => DateTime.instance.toggleIsDTCvisible())}
                    label={DateTime.instance.isDTCvisible.as(idv => idv ? "Ocultar Calendário, data e hora" : "Mostrar Calendário, data e hora")}
                    widthChars={30}
                />
                <label
                    cssClasses={["ToggleCava", "Option"]}
                    $={self => this.setupButton(self, () => Cava.instance.toggleVisibilityState())}
                    label={Cava.instance.visibilityState.as(vs => this.formatCavaVisiblityText(vs))}
                    widthChars={30}
                />
            </box>
        );
    }

    private get ControlCenterPopover() {
        return (
            <popover>
                <box cssClasses={["ControlCenterPopover"]}>
                    {/* WallpaperSelector.instance.WallpaperSelector  */}
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        {Bluetooth.instance.BluetoothPanel}
                        {this.ToggleVisibleComponents}
                    </box>
                </box>
            </popover>
        );
    }

    public get ControlCenter() {
        return (
            <menubutton cssClasses={["ControlCenter"]} popover={this.ControlCenterPopover as Gtk.Popover}>
                <label cssClasses={['Label']} label={'󰣇'} />
            </menubutton>
        );
    }
}
