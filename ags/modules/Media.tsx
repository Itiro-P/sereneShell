import { Gtk, Gdk } from "ags/gtk4";
import { Cava } from "./Cava";

const PlayerButtonIcons = {
    playing: "media-playback-start-symbolic",
    paused: "media-playback-pause-symbolic",
    stop: "media-playback-stop-symbolic",
    next: "media-skip-forward-symbolic",
    previous: "media-skip-backward-symbolic"
}

const cava = Cava() as Gtk.Widget;

function PlayerSlider() {
    return (
        <box cssClasses={["PlayerSlider"]}>
            <slider cssClasses={["Slider"]} value={0} min={0} max={100} step={1} sensitive={false} drawValue={false} />
            <label cssClasses={["TimeLabel"]} label={' '} />
        </box>
    );
}

function PlayerInfo() {
    return (
        <box cssClasses={["PlayerInfo"]} orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>
            <box cssClasses={["Info"]} orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>
                <label cssClasses={["Title"]} label={' '} ellipsize={3} maxWidthChars={15} widthChars={30} />
                <label cssClasses={["Artist"]} label={' '} ellipsize={3} maxWidthChars={15} widthChars={30} />
                <label cssClasses={["Album"]} label={' '} ellipsize={3} maxWidthChars={15} widthChars={30} />
            </box>
            <box cssClasses={["LowerPart"]} halign={Gtk.Align.CENTER} orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>
                <PlayerSlider />
                <box cssClasses={["Controllers"]} halign={Gtk.Align.CENTER}>
                    <box cssClasses={["Previous"]} sensitive={false}>
                        <image iconSize={Gtk.IconSize.LARGE} iconName={PlayerButtonIcons.previous} />
                    </box>
                    <box cssClasses={["PlayPause"]} sensitive={false}>
                        <image iconSize={Gtk.IconSize.LARGE} iconName={' '} />
                    </box>
                    <box cssClasses={["Next"]} sensitive={false}>
                        <image iconSize={Gtk.IconSize.LARGE} iconName={PlayerButtonIcons.next} />
                    </box>
                </box>
            </box>
        </box>
    );
}

export function MprisPlayer() {
    return (
        <overlay
            cssClasses={["MprisPlayer"]}
            $={
                (self: Gtk.Overlay) => {
                    const playerInfo = PlayerInfo() as Gtk.Widget;

                    self.set_child(cava);
                    self.add_overlay(playerInfo);
                    self.set_measure_overlay(playerInfo, true);
                    self.set_clip_overlay(playerInfo, false);
                }
            }
            overflow={Gtk.Overflow.HIDDEN}
        />
    );
}

export default function Media() {
    return (
        <menubutton alwaysShowArrow={false} cssClasses={["Media"]} popover={<popover><MprisPlayer /></popover> as Gtk.Popover}>
            <label label={' '} widthChars={12}/>
        </menubutton>
    );
}
