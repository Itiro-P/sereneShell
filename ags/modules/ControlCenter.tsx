import { Gdk, Gtk } from "ags/gtk4";
import { animationsEnabled, toggleAnimations } from "../services/Animations";
import { onCleanup } from "ags";
import DateTime from "./DateTime";
import { setShouldCavaAppear, shouldCavaAppear } from "./Cava";
import WallpaperSelector from "./WallpaperSelector";

function ToggleVisibleComponents() {
    return (
        <box cssClasses={["ToggleVisibleComponents"]} orientation={Gtk.Orientation.VERTICAL}>
            <label cssClasses={["Subtitle"]} label={'Animações e componentes'} />
            <label
                cssClasses={["ToggleAnimations", "Option"]}
                $={self => {
                    const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                    const handler = click.connect('pressed', () => toggleAnimations());
                    self.add_controller(click);
                    onCleanup(() => click.disconnect(handler));
                }}
                label={animationsEnabled.as(ae => ae ? "Desativar animações": "Ativar animações")}
                widthChars={30}
            />
            <label
                cssClasses={["ToggleDateTimeCalendar", "Option"]}
                $={self => {
                    const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                    const handler = click.connect('pressed', () => DateTime.instance.toggleIsDTCvisible());
                    self.add_controller(click);
                    onCleanup(() => click.disconnect(handler));
                }}
                label={DateTime.instance.isDTCvisible.as(idv => idv ? "Ocultar Calendário, data e hora": "Mostrar Calendário, data e hora")}
                widthChars={30}
            />
            <label
                cssClasses={["ToggleCava", "Option"]}
                $={self => {
                    const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                    const handler = click.connect('pressed', () => setShouldCavaAppear(!shouldCavaAppear.get()));
                    self.add_controller(click);
                    onCleanup(() => click.disconnect(handler));
                }}
                label={shouldCavaAppear.as(sca => sca ? "Ocultar Cava": "Mostrar Cava")}
                widthChars={30}
            />
        </box>
    );
}

function ControlCenterPopover() {
    return (
        <popover>
            <box cssClasses={["ControlCenterPopover"]}>
                {WallpaperSelector.instance.WallpaperSelector}
                <ToggleVisibleComponents />
            </box>
        </popover>
    );
}

export default function ControlCenter() {
    return (
        <menubutton cssClasses={["ControlCenter"]} popover={ControlCenterPopover() as Gtk.Popover} />
    );
}
