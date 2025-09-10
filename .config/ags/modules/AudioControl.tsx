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

    private Endpoint(endpoint: Accessor<Wp.Endpoint>) {
        return (
            <box>
            <With value={endpoint}>
                {edp => {
                    const icon = createBinding(edp, 'volumeIcon');
                    const volume = createBinding(edp, 'volume').as(a => `${Math.round(a * 100)}%`);

                    return (
                        <box>
                            <Gtk.EventControllerScroll flags={Gtk.EventControllerScrollFlags.VERTICAL} onScroll={(src, dx, dy) => this.handleScroll(edp, dy)} />
                            <button cssClasses={["Endpoint"]} onClicked={() => edp.set_mute(!edp.get_mute())}>
                                <box>
                                    <image cssClasses={["Icon"]} iconName={icon} />
                                    <label cssClasses={["Volume"]} label={volume} widthChars={4} />
                                </box>
                            </button>
                        </box>
                    );
                }}
            </With>
            </box>
        );
    }

    private MixerEntry(endpoint: Accessor<Wp.Endpoint>) {
        return (
            <box>
                <With value={endpoint}>
                    {edp => {
                        const icon = createBinding(edp, 'volumeIcon');
                        const volume = createBinding(edp, 'volume');

                        return (
                            <box cssClasses={["MixerEntry"]}>
                                <button cssClasses={["Icon"]} iconName={icon} onClicked={() => edp.set_mute(!edp.get_mute())} />
                                <box>
                                    <Gtk.EventControllerScroll flags={Gtk.EventControllerScrollFlags.VERTICAL} onScroll={(src, dx, dy) => this.handleScroll(edp, dy)} />
                                    <slider cssClasses={["Slider"]} value={volume} step={0.1} min={0} max={1} onChangeValue={({ value }) => edp.set_volume(value)} />
                                </box>
                            </box>
                        );
                    }}
                </With>
            </box>
        );
    }

    private get Mixer() {
        return (
            <popover cssClasses={["Mixer"]}>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    <label cssClasses={["Label"]} label={"Mixer"} />
                    {this.MixerEntry(this.defaultSpeaker)}
                    {this.MixerEntry(this.defaultMicrophone)}
                </box>
            </popover>
        );
    }

    public get AudioControl() {
        return (
            <box cssClasses={["AudioControl"]}>
                <Gtk.GestureClick button={Gdk.BUTTON_SECONDARY} onPressed={() => GLib.spawn_command_line_async('pavucontrol')} />
                {this.Endpoint(this.defaultSpeaker)}
                <menubutton popover={this.Mixer as Gtk.Popover} child={<label label={''}></label> as Gtk.Widget} />
            </box>
        );
    }
}

const audioControl = new AudioControlClass;

export default audioControl;
