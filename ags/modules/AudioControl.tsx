import Wp from "gi://AstalWp";
import GLib from "gi://GLib?version=2.0";
import { Gtk, Gdk } from "ags/gtk4";
import { Accessor, createBinding, onCleanup, With } from "ags";

export default class AudioControl {
    private static _instance: AudioControl;
    private default: Wp.Wp;
    private defaultSpeaker: Accessor<Wp.Endpoint>;
    private defaultMicrophone: Accessor<Wp.Endpoint>;
    private readonly step: number = 0.02;

    private constructor() {
        this.default = Wp.get_default()!;
        this.defaultSpeaker = createBinding(this.default, 'defaultSpeaker');
        this.defaultMicrophone = createBinding(this.default, 'defaultMicrophone');
    }

    private handleScroll(edp: Wp.Endpoint, dy: number) {
        let newVolume = edp.get_volume();
        if(dy < 0) newVolume += this.step;
        else newVolume -= this.step;
        edp.set_volume(newVolume);
    }

    private Endpoint({ endpoint }: { endpoint: Accessor<Wp.Endpoint> }) {
        return (
            <box>
            <With value={endpoint}>
                {edp => {
                    const icon = createBinding(edp, 'volumeIcon');
                    const volume = createBinding(edp, 'volume').as(a => `${Math.round(a * 100)}%`);
                    const leftClick = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                    const leftHandler = leftClick.connect('pressed', () => edp.set_mute(!edp.get_mute()));

                    const scroll = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.VERTICAL });
                    const scrollHandler = scroll.connect('scroll', (controler: Gtk.EventControllerScroll, dx: number, dy: number) => this.handleScroll(edp, dy));

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

    private MixerEntry({ endpoint }: { endpoint: Accessor<Wp.Endpoint> }) {
        return (
            <box>
                <With value={endpoint}>
                    {edp => {
                        const icon = createBinding(edp, 'volumeIcon');
                        const volume = createBinding(edp, 'volume');
                        const toggleMuteClick = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                        const toggleMuteHandler = toggleMuteClick.connect('pressed', () => edp.set_mute(!edp.get_mute()));

                        const scroll = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.VERTICAL });
                        const scrollHandler = scroll.connect('scroll', (controler: Gtk.EventControllerScroll, dx: number, dy: number) => this.handleScroll(edp, dy));

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

    public static get instance() {
        if(!this._instance) {
            this._instance = new AudioControl;
        }
        return this._instance;
    }
}
