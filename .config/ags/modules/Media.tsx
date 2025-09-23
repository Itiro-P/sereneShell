import { Accessor, createBinding, createState, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import AstalMpris from "gi://AstalMpris?version=0.1";
import Pango from "gi://Pango?version=1.0";
import cava from "./Cava";

type PlayerButton = 'previous' | 'next' | 'playing' | 'paused' | 'stopped';

const PlayerButtonIcons = {
    playing: "media-playback-start-symbolic",
    paused: "media-playback-pause-symbolic",
    stopped: "media-playback-stop-symbolic",
    next: "media-skip-forward-symbolic",
    previous: "media-skip-backward-symbolic"
}

type PlayerData = {
    active: boolean,
    title: Accessor<string> | string,
    artist: Accessor<string> | string,
    album: Accessor<string> | string,
    statusIcon: Accessor<string> | string,
    statusText: Accessor<string> | string,
    next: () => void,
    previous: () => void,
    playPause: () => void
}

class MediaClass {
    private mpris: AstalMpris.Mpris;
    private _activePlayerData: Accessor<PlayerData>;
    private readonly metadataArray: string[] = ["Title", "Artist", "Album"];

    public constructor() {
        this.mpris = AstalMpris.get_default();
        this._activePlayerData = createBinding(this.mpris, "players")(
            (players) => {
                let playing: AstalMpris.Player | null = null;
                let paused: AstalMpris.Player | null = null;
                let final: AstalMpris.Player | null = null;

                for (const player of players) {
                    const status = player.get_playback_status();
                    if (status === AstalMpris.PlaybackStatus.PLAYING) {
                        playing = player;
                        break;
                    } else if (status === AstalMpris.PlaybackStatus.PAUSED) {
                        paused = player;
                    }
                }

                final = playing || paused;

                if (final !== null) {
                    const status = createBinding(final, 'playbackStatus');
                    const canGoNext = createBinding(final, 'canGoNext');
                    const canGoPrevious = createBinding(final, 'canGoPrevious');
                    const canPause = createBinding(final, 'canPause');
                    const canPlay = createBinding(final, 'canPlay');

                    return {
                        active: true,
                        title: createBinding(final, 'title'),
                        artist: createBinding(final, 'artist'),
                        album: createBinding(final, 'album'),
                        statusIcon: status(st => this.getPlayerStatusIcon(st === AstalMpris.PlaybackStatus.PLAYING ? 'paused' : 'playing')),
                        statusText: status(st => this.getPlayerStatus(st)),
                        next: () => {
                            if (canGoNext.get()) final!.next();
                        },
                        previous: () => {
                            if (canGoPrevious.get()) final!.previous();
                        },
                        playPause: () => {
                            if (canPause.get() || canPlay.get()) final!.play_pause();
                        }
                    };
                }

                return {
                    active: false,
                    title: 'Nenhum player ativo',
                    artist: '',
                    album: '',
                    statusIcon: PlayerButtonIcons.stopped,
                    statusText: this.getPlayerStatus(AstalMpris.PlaybackStatus.STOPPED),
                    next: () => { },
                    previous: () => { },
                    playPause: () => { }
                };
            }
        );
    }

    private getPlayerStatus(status: AstalMpris.PlaybackStatus) {
        switch(status) {
            case AstalMpris.PlaybackStatus.PLAYING:
                return 'Playing';
            case AstalMpris.PlaybackStatus.PAUSED:
                return 'Paused';
            default:
                return 'Nothing Playing';
        }
    }

    private getPlayerStatusIcon(status: PlayerButton) {
        switch(status) {
            case 'previous':
                return PlayerButtonIcons.previous;
            case 'playing':
                return PlayerButtonIcons.playing;
            case 'paused':
                return PlayerButtonIcons.paused;
            case 'stopped':
                return PlayerButtonIcons.stopped;
            case 'next':
                return PlayerButtonIcons.next;
            default:
                return PlayerButtonIcons.stopped;
        }
    }

    public get Media() {
        return (
            <revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} transitionDuration={500} revealChild={this._activePlayerData(apd => apd.active)}>
            <With value={this._activePlayerData}>
                {player => {
                    const [hovered, setHovered] = createState(false);
                    const visibleChild = hovered(h => h ? 'FullStatus' : 'MinimalStatus');

                    const [visibleChildMetadata, setVisibleMetadata] = createState(0);
                    return (
                        <box cssClasses={["Media"]}>
                            <Gtk.EventControllerMotion onEnter={() => { if(player.active) { setHovered(true) }}} onLeave={() => setHovered(false)} />
                            <stack
                                visibleChildName={visibleChild}
                                transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                                transitionDuration={300}
                            >
                                <box $type="named" name={'MinimalStatus'} cssClasses={["MinimalStatus"]}>
                                    <label label={player.statusText} widthChars={10} />
                                    <box children={cava.Cava(["CavaMedia"])} hexpand={false} widthRequest={140} />
                                </box>
                                <box $type="named" name={'FullStatus'} cssClasses={["FullStatus"]}>
                                    <Gtk.EventControllerMotion onLeave={() => setVisibleMetadata(0)} />
                                    <stack
                                        visibleChildName={visibleChildMetadata(vcm => this.metadataArray[vcm])}
                                        transitionType={Gtk.StackTransitionType.SLIDE_DOWN}
                                        transitionDuration={300}
                                    >
                                        <Gtk.GestureClick button={Gdk.BUTTON_PRIMARY} onPressed={() => {setVisibleMetadata((visibleChildMetadata.get() + 1)%3)}} />
                                        <label $type="named" name={"Title"} cssClasses={["Title"]} label={player.title} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={16} />
                                        <label $type="named" name={"Artist"} cssClasses={["Artist"]} label={player.artist} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={16} />
                                        <label $type="named" name={"Album"} cssClasses={["Album"]} label={player.album} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={16} />
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
