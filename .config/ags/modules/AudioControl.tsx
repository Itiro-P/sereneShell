import AstalWp from "gi://AstalWp?version=0.1";
import GLib from "gi://GLib?version=2.0";
import { Gtk, Gdk } from "ags/gtk4";
import { Accessor, createBinding, With } from "ags";
import { wirePumblerService } from "../services";

const volumeStep = 0.02;

export namespace AudioControl {
    function handleScroll(edp: AstalWp.Endpoint, dy: number) {
        edp.set_volume(Math.min(edp.get_volume() + ((dy < 0 ? 1 : -1) * volumeStep), 1));
    }

    function Endpoint({ endpoint }: { endpoint: Accessor<AstalWp.Endpoint> }) {
        return (
            <box>
            <With value={endpoint}>
                {edp => {
                    const icon = createBinding(edp, 'volumeIcon');
                    const volume = createBinding(edp, 'volume')(a => `${Math.round(a * 100)}%`);

                    return (
                        <box>
                            <Gtk.EventControllerScroll flags={Gtk.EventControllerScrollFlags.VERTICAL} onScroll={(src, dx, dy) => handleScroll(edp, dy)} />
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

    function MixerEntry({ endpoint }: { endpoint: Accessor<AstalWp.Endpoint> }) {
        return (
            <box>
                <With value={endpoint}>
                    {edp => {
                        const icon = createBinding(edp, 'volumeIcon');
                        const volume = createBinding(edp, 'volume');

                        return (
                            <box cssClasses={["MixerEntry"]}>
                                <Gtk.EventControllerScroll flags={Gtk.EventControllerScrollFlags.VERTICAL} onScroll={(src, dx, dy) => handleScroll(edp, dy)} />
                                <button cssClasses={["Icon"]} iconName={icon} onClicked={() => edp.set_mute(!edp.get_mute())} />
                                <slider cssClasses={["Slider"]} value={volume} step={0.1} min={0} max={1} onChangeValue={({ value }) => edp.set_volume(value)} hexpand />
                                <label cssClasses={["PercentageLabel"]} label={volume(v => `${Math.round(v * 100)}%`)} widthChars={4} />
                            </box>
                        );
                    }}
                </With>
            </box>
        );
    }

    export function Mixer() {
        return (
            <box cssClasses={["Mixer"]} orientation={Gtk.Orientation.VERTICAL}>
                <box cssClasses={["Title"]} halign={Gtk.Align.CENTER} hexpand>
                    <label cssClasses={["Label"]} label={"Mixer"} />
                    <button cssClasses={["PavucontrolButton"]} label={"Pavucontrol"} onClicked={(self) => GLib.spawn_command_line_async('pavucontrol')} />
                </box>
                <MixerEntry endpoint={wirePumblerService.defaultSpeaker} />
                <MixerEntry endpoint={wirePumblerService.defaultMicrophone} />
            </box>
        );
    }

    export function AudioControl() {
        return (
            <box cssClasses={["AudioControl"]}>
                <Gtk.GestureClick button={Gdk.BUTTON_SECONDARY} onPressed={() => GLib.spawn_command_line_async('pavucontrol')} />
                <Endpoint endpoint={wirePumblerService.defaultSpeaker} />
                <Endpoint endpoint={wirePumblerService.defaultMicrophone} />
            </box>
        );
    }
}
