import Wp from "gi://AstalWp";
import GLib from "gi://GLib?version=2.0";
import { Gtk, Gdk } from "ags/gtk4";
import { Accessor, createBinding, For, onCleanup, With } from "ags";

const wp = Wp.get_default()!;
const audio = createBinding(wp, 'defaultSpeaker');
const mic = createBinding(wp, 'defaultMicrophone');
const step = 0.02;

function handleScroll(edp: Wp.Endpoint, dy: number) {
    let newVolume = edp.get_volume();
    if(dy < 0) newVolume += step;
    else newVolume -= step;
    edp.set_volume(newVolume);
};

function Endpoint({ endpoint }: { endpoint: Accessor<Wp.Endpoint> }) {
    return (
        <box>
        <With value={endpoint}>
            {edp => {
                const icon = createBinding(edp, 'volumeIcon');
                const volume = createBinding(edp, 'volume').as(a => `${Math.round(a * 100)}%`);
                const leftClick = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                const leftHandler = leftClick.connect('pressed', () => edp.set_mute(!edp.get_mute()));

                const scroll = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.VERTICAL });
                const scrollHandler = scroll.connect('scroll', (controler: Gtk.EventControllerScroll, dx: number, dy: number) => handleScroll(edp, dy));

                onCleanup(() => {
                    leftClick.disconnect(leftHandler);
                    scroll.disconnect(scrollHandler);
                });
                return (
                    <box cssClasses={["Endpoint"]}
                        $={
                            (self) => {
                                self.add_controller(leftClick);
                                self.add_controller(scroll);
                            }
                        }
                    >
                        <image cssClasses={["Icon"]} iconName={icon} />
                        <label cssClasses={["Volume"]} label={volume} widthChars={3} maxWidthChars={3} />
                    </box>
                );
            }}
        </With>
        </box>
    );
}

function MixerEntry({ endpoint }: { endpoint: Accessor<Wp.Endpoint> }) {
    return (
        <box>
            <With value={endpoint}>
                {edp => {
                    const icon = createBinding(edp, 'volumeIcon');
                    const volume = createBinding(edp, 'volume');
                    const toggleMuteClick = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                    const toggleMuteHandler = toggleMuteClick.connect('pressed', () => edp.set_mute(!edp.get_mute()));

                    const scroll = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.VERTICAL });
                    const scrollHandler = scroll.connect('scroll', (controler: Gtk.EventControllerScroll, dx: number, dy: number) => handleScroll(edp, dy));

                    onCleanup(() => {
                        toggleMuteClick.disconnect(toggleMuteHandler);
                        scroll.disconnect(scrollHandler);
                    });

                    return (
                        <box cssClasses={["MixerEntry"]}>
                            <image cssClasses={["Icon"]} iconName={icon} $={self => self.add_controller(toggleMuteClick)} />
                            <slider cssClasses={["Slider"]} $={self => self.add_controller(scroll)} value={volume} step={0.1} min={0} max={1} onChangeValue={({ value }) => edp.set_volume(value)} />
                        </box>
                    );
                }}
            </With>
        </box>
    );
}

function Mixer() {
    return (
        <box cssClasses={["Mixer"]} orientation={Gtk.Orientation.VERTICAL}>
            <label cssClasses={["Label"]} label={"Mixer"} />
            <MixerEntry endpoint={audio} />
            <MixerEntry endpoint={mic} />
        </box>
    );
}

export default function AudioControl() {
    const spawnPavucontrolClick = new Gtk.GestureClick({ button: Gdk.BUTTON_SECONDARY });
    const spawnPavucontrolHandler = spawnPavucontrolClick.connect('pressed', () => GLib.spawn_command_line_async('pavucontrol'));

    onCleanup(() => spawnPavucontrolClick.disconnect(spawnPavucontrolHandler));

    return (
        <box cssClasses={["AudioControl"]} $={self => self.add_controller(spawnPavucontrolClick)}>
            <Endpoint endpoint={audio} />
            <menubutton popover={<popover><Mixer /></popover> as Gtk.Popover} />
        </box>
    );
}
