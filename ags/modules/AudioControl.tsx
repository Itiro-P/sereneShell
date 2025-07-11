import Wp from "gi://AstalWp"
import { bind, GLib } from "astal"
import { Gtk, Gdk } from "astal/gtk4";

type MouseClickHandlers = {
    left: number,
    right: number
}

type AudioHandlers = {
    scroll: number,
    mouse: MouseClickHandlers
}

const audio = Wp.get_default()!.defaultSpeaker!;
const step = 0.02;

const handleScroll = (controler: Gtk.EventControllerScroll, dx: number, dy: number) => {
    let newVolume = audio.get_volume();
    if(dy < 0) newVolume += step;
    else newVolume -= step;
    audio.set_volume(newVolume);
};

export default function AudioControl() {
    const scroll = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.VERTICAL });
    const click = { left: new Gtk.GestureClick(), right: new Gtk.GestureClick() };
    click.left.set_button(Gdk.BUTTON_PRIMARY);
    click.right.set_button(Gdk.BUTTON_SECONDARY);
    const handlers: AudioHandlers = {
        scroll: scroll.connect("scroll", handleScroll),
        mouse: {
            left: click.left.connect("pressed", () => { audio.set_mute(!audio.get_mute()) } ),
            right: click.right.connect("pressed", () => { GLib.spawn_command_line_async("pavucontrol") } )
        }
    }

    return (
        <box
            cssClasses={["AudioControl"]}
            setup={
                (self) => {
                    self.add_controller(click.left);
                    self.add_controller(click.right);
                    self.add_controller(scroll);
                }
            }
            onDestroy={
                () => {
                    scroll.disconnect(handlers.scroll);
                    click.left.disconnect(handlers.mouse.left);
                    click.right.disconnect(handlers.mouse.right);
                }
            }
            tooltipText={ bind(audio, "description").as(n => `Dispositivo atual: ${n}`) }
        >
            <image cssClasses={["AudioIcon"]} iconName={ bind(audio, "volumeIcon") } />
            <label cssClasses={["AudioLabel"]} label={ bind(audio, "volume").as(a => `${Math.round(a * 100)}%`) } />
        </box>
    );
}
