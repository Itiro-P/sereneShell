import Wp from "gi://AstalWp";
import GLib from "gi://GLib?version=2.0";
import { Gtk, Gdk } from "ags/gtk4";
import { Accessor, createBinding, onCleanup, With } from "ags";

class AudioControlClass {
    private default: Wp.Wp;
    private defaultSpeaker: Accessor<Wp.Endpoint>;
    private defaultMicrophone: Accessor<Wp.Endpoint>;
    private readonly step: number = 0.02;

    public constructor() {
        this.default = Wp.get_default()!;
        this.defaultSpeaker = createBinding(this.default, 'defaultSpeaker');
        this.defaultMicrophone = createBinding(this.default, 'defaultMicrophone');
    }

    private handleScroll(edp: Wp.Endpoint, dy: number) {
        let newVolume = edp.get_volume();
        if(dy < 0) newVolume += this.step;
        else newVolume -= this.step;
        edp.set_volume(Math.min(newVolume, 1));
    }

    private Endpoint({ endpoint }: { endpoint: Accessor<Wp.Endpoint> }) {
        return (
            <box>
            <With value={endpoint}>
                {edp => {
                    const icon = createBinding(edp, 'volumeIcon');
                    const volume = createBinding(edp, 'volume').as(a => `${Math.round(a * 100)}%`);

                    const scroll = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.VERTICAL });
                    const scrollHandler = scroll.connect('scroll', (controler: Gtk.EventControllerScroll, dx: number, dy: number) => this.handleScroll(edp, dy));

                    onCleanup(() => scroll.disconnect(scrollHandler));
                    return (
                        <button cssClasses={["Endpoint"]}
                            $={(self) => self.add_controller(scroll)}
                            onClicked={() => edp.set_mute(!edp.get_mute())}
                        >
                            <box>
                                <image cssClasses={["Icon"]} iconName={icon} />
                                <label cssClasses={["Volume"]} label={volume} widthChars={4} />
                            </box>
                        </button>
                    );
                }}
            </With>
            </box>
        );
    }

    private MixerEntry({ endpoint }: { endpoint: Accessor<Wp.Endpoint> }) {
        return (
            <box>
                <With value={endpoint}>
                    {edp => {
                        const icon = createBinding(edp, 'volumeIcon');
                        const volume = createBinding(edp, 'volume');

                        const scroll = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.VERTICAL });
                        const scrollHandler = scroll.connect('scroll', (controler: Gtk.EventControllerScroll, dx: number, dy: number) => this.handleScroll(edp, dy));

                        onCleanup(() => scroll.disconnect(scrollHandler));

                        return (
                            <box cssClasses={["MixerEntry"]}>
                                <button cssClasses={["Icon"]} iconName={icon} onClicked={() => edp.set_mute(!edp.get_mute())} />
                                <slider cssClasses={["Slider"]} $={self => self.add_controller(scroll)} value={volume} step={0.1} min={0} max={1} onChangeValue={({ value }) => edp.set_volume(value)} />
                            </box>
                        );
                    }}
                </With>
            </box>
        );
    }

    private Mixer() {
        return (
            <popover cssClasses={["Mixer"]}>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    <label cssClasses={["Label"]} label={"Mixer"} />
                    {this.MixerEntry({ endpoint: this.defaultSpeaker })}
                    {this.MixerEntry({ endpoint: this.defaultMicrophone })}
                </box>
            </popover>
        );
    }

    public get AudioControl() {
        const spawnPavucontrolClick = new Gtk.GestureClick({ button: Gdk.BUTTON_SECONDARY });
        const spawnPavucontrolHandler = spawnPavucontrolClick.connect('pressed', () => GLib.spawn_command_line_async('pavucontrol'));

        onCleanup(() => spawnPavucontrolClick.disconnect(spawnPavucontrolHandler));

        return (
            <box cssClasses={["AudioControl"]} $={self => self.add_controller(spawnPavucontrolClick)}>
                {this.Endpoint({ endpoint: this.defaultSpeaker })}
                <menubutton popover={this.Mixer() as Gtk.Popover} child={<label label={''}></label> as Gtk.Widget} />
            </box>
        );
    }
}

const audioControl = new AudioControlClass;

export default audioControl;
