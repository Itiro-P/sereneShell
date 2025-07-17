import Wp from "gi://AstalWp"
import { bind, GLib } from "astal"
import { Gtk, Gdk } from "astal/gtk4";

interface MixerEntryProps {
    stream: Wp.Stream;
}

type MouseClickHandlers = {
    left: number,
    right: number
}

const audio = Wp.get_default()!.get_default_speaker()!;
const audioObj = Wp.get_default()!.get_audio()!;
const step = 0.02;

function handleScroll(endpoint: Wp.Endpoint | Wp.Stream, dy: number) {
    let newVolume = endpoint.get_volume();
    if(dy < 0) newVolume += step;
    else newVolume -= step;
    endpoint.set_volume(newVolume);
};

function setupScrollHandler(target: Wp.Endpoint | Wp.Stream): { controller: Gtk.EventControllerScroll, handlerId: number } {
    const controller = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.VERTICAL });
    const handlerId = controller.connect("scroll", (controler: Gtk.EventControllerScroll, dx: number, dy: number) => handleScroll(target, dy));

    return { controller, handlerId };
}

function setupMuteHandler(target: Wp.Endpoint | Wp.Stream): { controllers: { left: Gtk.GestureClick, right: Gtk.GestureClick }, handlerIds: { left: number, right: number } } {
    const leftController = new Gtk.GestureClick();
    const rightController = new Gtk.GestureClick();

    leftController.set_button(Gdk.BUTTON_PRIMARY);
    rightController.set_button(Gdk.BUTTON_SECONDARY);

    const leftHandlerId = leftController.connect("pressed", () => { target.set_mute(!target.get_mute()) });
    const rightHandlerId = target instanceof Wp.Endpoint ? rightController.connect("pressed", () => { GLib.spawn_command_line_async("pavucontrol") }) : 0;

    return {
        controllers: {
            left: leftController,
            right: rightController
        },
        handlerIds: {
            left: leftHandlerId,
            right: rightHandlerId
        }
    };
}

function MixerEntry({ stream }: MixerEntryProps) {
    const scrollHandler = setupScrollHandler(stream);
    const muteHandler = setupMuteHandler(stream);

    return (
        <box cssClasses={["MixerEntry"]} orientation={Gtk.Orientation.VERTICAL}>
            <box
                cssClasses={bind(stream, "mute").as(m => ["EntryName", m ? "Playing" : "Muted"])}
                setup={(self) => self.add_controller(muteHandler.controllers.left)}
                onDestroy={() => muteHandler.controllers.left.disconnect(muteHandler.handlerIds.left)}
            >
                <image iconName={bind(stream, "volume_icon")} />
                <label label={stream.get_name()} maxWidthChars={22} ellipsize={3} />
            </box>
            <slider
                cssClasses={["EntrySlider"]}
                value={bind(stream, "volume")}
                onChangeValue={({ value }) => stream.set_volume(value)}
                setup={(self) => self.add_controller(scrollHandler.controller)}
                onDestroy={() => scrollHandler.controller.disconnect(scrollHandler.handlerId)}
            />
        </box>
    );
}

function MixerPopover() {
    return (
        <popover
            cssClasses={["MixerPopover"]}
            child={
                <box orientation={Gtk.Orientation.VERTICAL}>
                    {bind(audioObj, "streams").as(c => c.map(stream => <MixerEntry stream={stream} />))}
                </box>
            }
        />
    );
}


export default function AudioControl() {
    const scrollHandler = setupScrollHandler(audio);
    const muteHandler = setupMuteHandler(audio);

    return (
        <box cssClasses={["AudioControl"]} tooltipText={bind(audio, "description").as(n => `Dispositivo atual: ${n}`)}>
            <box
                setup={
                    (self) => {
                        self.add_controller(scrollHandler.controller);
                        self.add_controller(muteHandler.controllers.left);
                        self.add_controller(muteHandler.controllers.right);
                    }
                }
                onDestroy={
                    () => {
                        scrollHandler.controller.disconnect(scrollHandler.handlerId);

                        muteHandler.controllers.left.disconnect(muteHandler.handlerIds.left);
                        if(muteHandler.handlerIds.right != 0) {
                            muteHandler.controllers.right.disconnect(muteHandler.handlerIds.right);
                        }
                    }
                }
            >
                <image cssClasses={["AudioIcon"]} iconName={bind(audio, "volumeIcon")} />
                <label cssClasses={["AudioLabel"]} label={bind(audio, "volume").as(a => `${Math.round(a * 100)}%`)} widthChars={3} maxWidthChars={3} />
            </box>
            <menubutton cssClasses={["AudioMixer"]} sensitive={bind(audioObj, "streams").as(s => s.length > 0)} popover={MixerPopover() as Gtk.Popover} />
        </box>
    );
}
