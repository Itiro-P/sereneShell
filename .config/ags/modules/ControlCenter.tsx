import { Gdk, Gtk } from "ags/gtk4";
import animationService from "../services/Animations";
import { onCleanup } from "ags";
import dateTime from "./DateTime";
import cava, { CavaVisiblity } from "./Cava";
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
                    $={self => this.setupButton(self, () => animationService.toggleAnimations())}
                    label={animationService.animationsEnabled.as(ae => ae ? "Desativar animações" : "Ativar animações")}
                    widthChars={30}
                />
                <label
                    cssClasses={["ToggleDateTimeCalendar", "Option"]}
                    $={self => this.setupButton(self, () => dateTime.toggleIsDTCvisible())}
                    label={dateTime.isDTCvisible.as(idv => idv ? "Ocultar Calendário, data e hora" : "Mostrar Calendário, data e hora")}
                    widthChars={30}
                />
                <label
                    cssClasses={["ToggleCava", "Option"]}
                    $={self => this.setupButton(self, () => cava.toggleVisibilityState())}
                    label={cava.visibilityState.as(vs => this.formatCavaVisiblityText(vs))}
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
