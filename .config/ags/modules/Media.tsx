import { Accessor, createComputed, createState, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import Pango from "gi://Pango?version=1.0";
import cava from "./Cava";
import mprisManager, { PlayerButtonIcons } from "../services/Mpris";
import { formatTime } from "../services/TimeFormatter";

class MediaClass {
    private readonly metadataArray: string[] = ["Title", "Artist", "Album"];

    public constructor() {
    }

    public get Media() {
        return (
            <revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} transitionDuration={500} revealChild={mprisManager.activePlayerData(apd => apd.active)}>
            <With value={mprisManager.activePlayerData}>
                {player => {
                    const [hovered, setHovered] = createState(false);
                    const visibleChild = hovered(h => h ? 'FullStatus' : 'MinimalStatus');

                    const [visibleChildMetadata, setVisibleMetadata] = createState(0);
                    return (
                        <box cssClasses={["Media"]} overflow={Gtk.Overflow.HIDDEN}>
                            <Gtk.EventControllerMotion onEnter={() => { if(player.active) { setHovered(true) }}} onLeave={() => setHovered(false)} />
                            <stack
                                visibleChildName={visibleChild}
                                transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                                transitionDuration={300}
                            >
                                <box $type="named" name={'MinimalStatus'} cssClasses={["MinimalStatus"]}>
                                    <box marginEnd={10}>
                                        <label label={player.statusText} widthChars={10} />
                                        <label label={createComputed(() => `${formatTime(player.position())} - ${formatTime(player.length())}`)} />
                                    </box>
                                    <box hexpand={false} widthRequest={140} children={cava.Cava(["CavaMedia"])} />
                                </box>
                                <box $type="named" name={'FullStatus'} cssClasses={["FullStatus"]}>
                                    <Gtk.EventControllerMotion onLeave={() => setVisibleMetadata(0)} />
                                    <stack
                                        visibleChildName={visibleChildMetadata(vcm => this.metadataArray[vcm])}
                                        transitionType={Gtk.StackTransitionType.SLIDE_DOWN}
                                        transitionDuration={300}
                                    >
                                        <Gtk.GestureClick button={Gdk.BUTTON_PRIMARY} onPressed={() => {setVisibleMetadata((visibleChildMetadata.peek() + 1)%3)}} />
                                        <label $type="named" name={"Title"} cssClasses={["Title"]} label={player.title} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={26} />
                                        <label $type="named" name={"Artist"} cssClasses={["Artist"]} label={player.artist} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={26} />
                                        <label $type="named" name={"Album"} cssClasses={["Album"]} label={player.album} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={26} />
                                    </stack>
                                    <box cssClasses={["Controllers"]}>
                                        <button
                                            cssClasses={["Previous"]}
                                            iconName={PlayerButtonIcons.previous}
                                            onClicked={player.previous}
                                        />
                                        <button
                                            cssClasses={["PlayPause"]}
                                            iconName={player.statusIcon}
                                            onClicked={player.playPause}
                                        />
                                        <button
                                            cssClasses={["Next"]}
                                            iconName={PlayerButtonIcons.next}
                                            onClicked={player.next}
                                        />
                                    </box>
                                </box>
                            </stack>
                        </box>
                    );
                }}
            </With>
            </revealer>
        );
    }
}

const media = new MediaClass;

export default media;
