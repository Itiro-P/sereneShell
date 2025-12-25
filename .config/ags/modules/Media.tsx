import { Accessor, createBinding, createComputed, createState, For, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import Pango from "gi://Pango?version=1.0";
import { mprisManager, PlayerButtonIcons } from "../services";
import { formatTime } from "../services/TimeFormatter";
import AstalMpris from "gi://AstalMpris?version=0.1";
import Adw from "gi://Adw?version=1";
import { Image } from "../services";
import Gly from "gi://Gly?version=2";

const metadataArray: string[] = ["Title", "Artist", "Album"];
const coverSize = { width: 96, height: 96 };
const frameRequest = new Gly.FrameRequest();
frameRequest.set_scale(coverSize.width, coverSize.height);

class MediaClass {
    public constructor() {
    }

    private CoverArt({ path }: { path: Accessor<string> }) {
        return (
            <box cssClasses={["CoverArt"]} halign={Gtk.Align.CENTER}>
                <With value={path}>
                    {p => {
                        const [img, setImg] = createState<Gdk.Paintable>(Gdk.Paintable.new_empty(coverSize.width, coverSize.height));

                        Image.loadImage(p, frameRequest).then(cover => cover && setImg(cover));
                        return (
                            <Adw.Clamp maximumSize={coverSize.height} heightRequest={coverSize.height}>
                                <Adw.Clamp maximumSize={coverSize.width} widthRequest={coverSize.width}>
                                    <Gtk.Picture contentFit={Gtk.ContentFit.COVER} paintable={img} />
                                </Adw.Clamp>
                            </Adw.Clamp>
                        );
                    }}
                </With>
            </box>
        );
    }

    private Player(player: AstalMpris.Player) {
        const title = createBinding(player, "title");
        const artist = createBinding(player, "artist");
        const album = createBinding(player, "album");
        const playbackStatus = createBinding(player, "playbackStatus");
        const position = createBinding(player, "position");
        const length = createBinding(player, "length");
        const timeRemaining = createComputed(() => `${formatTime(position())} - ${formatTime(length())}`);
        return (
            <box cssClasses={["Player"]} orientation={Gtk.Orientation.VERTICAL}>
                <box cssClasses={["Metadata"]} orientation={Gtk.Orientation.VERTICAL}>
                    <this.CoverArt path={createBinding(player, "coverArt")} />
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        <label name={"Title"} cssClasses={["Title"]} label={title} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={22} />
                        <label name={"Artist"} cssClasses={["Artist"]} label={artist} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={22} />
                        <label name={"Album"} cssClasses={["Album"]} label={album} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={22} />
                    </box>
                </box>
                <box halign={Gtk.Align.CENTER} cssClasses={["SliderSection"]} >
                    <slider
                        cssClasses={["Slider"]}
                        value={position}
                        max={length}
                        onChangeValue={(src, scrollType, value) => {
                            const seekStep = 5;

                            switch(scrollType) {
                                case Gtk.ScrollType.START:
                                    if (player.get_can_go_previous()) player.previous();
                                    break;

                                case Gtk.ScrollType.END:
                                    if (player.get_can_go_next()) player.next();
                                    break;

                                case Gtk.ScrollType.STEP_BACKWARD:
                                case Gtk.ScrollType.STEP_DOWN:
                                    player.set_position(Math.max(position.peek() - seekStep, 0));
                                    break;

                                case Gtk.ScrollType.STEP_FORWARD:
                                case Gtk.ScrollType.STEP_UP:
                                    player.set_position(Math.min(position.peek() + seekStep, length.peek()));
                                    break;

                                case Gtk.ScrollType.JUMP:
                                    player.set_position(value);
                                    break;

                                default:
                                    player.set_position(value);
                            }
                        }}
                    />
                    <label label={timeRemaining} cssClasses={["TimeRemaining"]} />
                </box>
                <box cssClasses={["Controllers"]} halign={Gtk.Align.CENTER}>
                    <button
                        cssClasses={["Previous"]}
                        iconName={PlayerButtonIcons.previous}
                        sensitive={createBinding(player, "canGoPrevious")}
                        onClicked={() => player.previous()}
                    />
                    <button
                        cssClasses={["PlayPause"]}
                        iconName={playbackStatus(ps => ps === AstalMpris.PlaybackStatus.PLAYING ? PlayerButtonIcons.paused : PlayerButtonIcons.playing)}
                        sensitive={createComputed(() => createBinding(player, "canPause")() && createBinding(player, "canPlay")())}
                        onClicked={() => player.play_pause()}
                    />
                    <button
                        cssClasses={["Next"]}
                        iconName={PlayerButtonIcons.next}
                        sensitive={createBinding(player, "canGoNext")}
                        onClicked={() => player.next()}
                    />
                </box>
            </box>
        );
    }

    public Media() {
        let carousel !: Adw.Carousel;
        return (
            <box cssClasses={["Media"]}>
                <Adw.Carousel
                    $={self => carousel = self}
                    orientation={Gtk.Orientation.VERTICAL}
                >
                    <For
                        each={mprisManager.players}
                        children={(player: AstalMpris.Player) => this.Player(player)}
                    />
                </Adw.Carousel>
                <Adw.CarouselIndicatorLines cssClasses={["Carousel"]} orientation={Gtk.Orientation.VERTICAL} carousel={carousel} />
            </box>
        );
    }

    public MediaMinimal() {
        return (
            <revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} transitionDuration={500} revealChild={mprisManager.isPlayerActive}>
            <With value={mprisManager.activePlayer}>
                {player => {
                    const [hovered, setHovered] = createState(false);
                    const visibleChild = hovered(h => h ? 'FullStatus' : 'MinimalStatus');
                    const [visibleChildMetadata, setVisibleMetadata] = createState(0);

                    const title = createBinding(player, "title");
                    const artist = createBinding(player, "artist");
                    const album = createBinding(player, "album");
                    const playbackStatus = createBinding(player, "playbackStatus");
                    const timeRemaining = createComputed(() => `${formatTime(createBinding(player, "position")())} - ${formatTime(createBinding(player, "length")())}`);
                    return (
                        <box cssClasses={["MediaMinimal"]} overflow={Gtk.Overflow.HIDDEN}>
                            <Gtk.EventControllerMotion onEnter={() => setHovered(true)} onLeave={() => setHovered(false)} />
                            <stack
                                visibleChildName={visibleChild}
                                transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                                transitionDuration={300}
                            >
                                <box $type="named" name={'MinimalStatus'} cssClasses={["MinimalStatus"]} halign={Gtk.Align.CENTER}>
                                    <label label={playbackStatus(ps => mprisManager.playerStatusStr(ps))} widthChars={10} />
                                    <label label={timeRemaining} />
                                </box>
                                <box $type="named" name={'FullStatus'} cssClasses={["FullStatus"]}>
                                    <Gtk.EventControllerMotion onLeave={() => setVisibleMetadata(0)} />
                                    <stack
                                        visibleChildName={visibleChildMetadata(vcm => metadataArray[vcm])}
                                        transitionType={Gtk.StackTransitionType.SLIDE_DOWN}
                                        transitionDuration={300}
                                    >
                                        <Gtk.GestureClick button={Gdk.BUTTON_PRIMARY} onPressed={() => {setVisibleMetadata((visibleChildMetadata.peek() + 1)%3)}} />
                                        <label $type="named" name={"Title"} cssClasses={["Title"]} label={title} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={26} />
                                        <label $type="named" name={"Artist"} cssClasses={["Artist"]} label={artist} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={26} />
                                        <label $type="named" name={"Album"} cssClasses={["Album"]} label={album} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={26} />
                                    </stack>
                                    <box cssClasses={["Controllers"]}>
                                        <button
                                            cssClasses={["Previous"]}
                                            iconName={PlayerButtonIcons.previous}
                                            sensitive={createBinding(player, "canGoPrevious")}
                                            onClicked={() => player.previous()}
                                        />
                                        <button
                                            cssClasses={["PlayPause"]}
                                            iconName={playbackStatus(ps => ps === AstalMpris.PlaybackStatus.PLAYING ? PlayerButtonIcons.paused : PlayerButtonIcons.playing)}
                                            sensitive={createComputed(() => createBinding(player, "canPause")() && createBinding(player, "canPlay")())}
                                            onClicked={() => player.play_pause()}
                                        />
                                        <button
                                            cssClasses={["Next"]}
                                            iconName={PlayerButtonIcons.next}
                                            sensitive={createBinding(player, "canGoNext")}
                                            onClicked={() => player.next()}
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
