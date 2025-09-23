import Wp from "gi://AstalWp";
import GLib from "gi://GLib?version=2.0";
import { Gtk, Gdk } from "ags/gtk4";
import { Accessor, createBinding, With } from "ags";

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
                    const volume = createBinding(edp, 'volume')(a => `${Math.round(a * 100)}%`);

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
                                <Gtk.EventControllerScroll flags={Gtk.EventControllerScrollFlags.VERTICAL} onScroll={(src, dx, dy) => this.handleScroll(edp, dy)} />
                                <button cssClasses={["Icon"]} iconName={icon} onClicked={() => edp.set_mute(!edp.get_mute())} />
                                <slider cssClasses={["Slider"]} value={volume} step={0.1} min={0} max={1} onChangeValue={({ value }) => edp.set_volume(value)} />
                                <label cssClasses={["PercentageLabel"]} label={volume(v => `${Math.round(v * 100)}%`)} maxWidthChars={4} hexpand />
                            </box>
                        );
                    }}
                </With>
            </box>
        );
    }

    public get Mixer() {
        return (
            <box cssClasses={["Mixer"]} orientation={Gtk.Orientation.VERTICAL}>
                <box cssClasses={["Title"]} halign={Gtk.Align.CENTER} hexpand>
                    <label cssClasses={["Label"]} label={"Mixer"} />
                    <button cssClasses={["PavucontrolButton"]} label={"Pavucontrol"} onClicked={(self) => GLib.spawn_command_line_async('pavucontrol')} />
                </box>
                {this.MixerEntry(this.defaultSpeaker)}
                {this.MixerEntry(this.defaultMicrophone)}
            </box>
        );
    }

    public get AudioControl() {
        return (
            <box cssClasses={["AudioControl"]}>
                <Gtk.GestureClick button={Gdk.BUTTON_SECONDARY} onPressed={() => GLib.spawn_command_line_async('pavucontrol')} />
                {this.Endpoint(this.defaultSpeaker)}
            </box>
        );
    }
}

const audioControl = new AudioControlClass;

export default audioControl;
