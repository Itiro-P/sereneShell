import { Accessor, createBinding, onCleanup, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import AstalMpris from "gi://AstalMpris?version=0.1";

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

class MprisManager {
    private static _instance: MprisManager;
    private mpris: AstalMpris.Mpris;
    private _activePlayerData: Accessor<PlayerData>;

    private constructor() {
        this.mpris = AstalMpris.get_default();
        this._activePlayerData = createBinding(this.mpris, "players").as(
            (players) => {
                let playing: AstalMpris.Player | null = null;
                let paused: AstalMpris.Player | null = null;
                let final: AstalMpris.Player | null = null;

                for (const player of players) {
                    if (player.get_playback_status() === AstalMpris.PlaybackStatus.PLAYING) {
                        playing = player;
                        break;
                    } else if (player.get_playback_status() === AstalMpris.PlaybackStatus.PAUSED) {
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
                        statusIcon: status.as(st => this.getPlayerStatusIcon(st === AstalMpris.PlaybackStatus.PLAYING ? 'paused' : 'playing')),
                        statusText: status.as(st => this.getPlayerStatus(st)),
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

    public static get instance() {
        if(!MprisManager._instance) {
            MprisManager._instance = new MprisManager;
        }
        return MprisManager._instance;
    }

    private getPlayerStatus(status: AstalMpris.PlaybackStatus) {
        switch(status) {
            case AstalMpris.PlaybackStatus.PLAYING:
                return 'Tocando';
            case AstalMpris.PlaybackStatus.PAUSED:
                return 'Pausado';
            default:
                return 'Nada tocando';
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

    public get activePlayerData() {
        return this._activePlayerData;
    }
}

export default function Media() {
    return (
        <box>
        <With value={MprisManager.instance.activePlayerData}>
            {player => {
                return (
                    <menubutton
                        alwaysShowArrow={false}
                        cssClasses={["Media"]}
                        sensitive={player.active}
                        popover={
                            <popover>
                                <box cssClasses={["MprisPopover"]} overflow={Gtk.Overflow.HIDDEN}>
                                    <box cssClasses={["MprisPlayer"]} orientation={Gtk.Orientation.VERTICAL}>
                                        <box cssClasses={["Metadata"]} orientation={Gtk.Orientation.VERTICAL}>
                                            <label cssClasses={["Title"]} label={player.title} ellipsize={3} maxWidthChars={15} widthChars={30} />
                                            <label cssClasses={["Artist"]} label={player.artist} ellipsize={3} maxWidthChars={15} widthChars={30} />
                                            <label cssClasses={["Album"]} label={player.album} ellipsize={3} maxWidthChars={15} widthChars={30} />
                                        </box>
                                        <box cssClasses={["LowerPart"]} orientation={Gtk.Orientation.VERTICAL}>
                                            <box cssClasses={["Controllers"]} halign={Gtk.Align.CENTER}>
                                                <box cssClasses={["Previous"]} sensitive={player.active}
                                                    $={
                                                        (self) => {
                                                            const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                                                            const handler = click.connect("pressed", player.previous);
                                                            self.add_controller(click);
                                                            onCleanup(() =>{click.disconnect(handler)});
                                                        }
                                                    }
                                                >
                                                    <image iconSize={Gtk.IconSize.LARGE} iconName={PlayerButtonIcons.previous} />
                                                </box>
                                                <box cssClasses={["PlayPause"]} sensitive={player.active}
                                                    $={
                                                        (self) => {
                                                            const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                                                            const handler = click.connect("pressed", player.playPause);
                                                            self.add_controller(click);
                                                            onCleanup(() =>{click.disconnect(handler)});
                                                        }
                                                    }
                                                >
                                                    <image iconSize={Gtk.IconSize.LARGE} iconName={player.statusIcon} />
                                                </box>
                                                <box cssClasses={["Next"]} sensitive={player.active}
                                                    $={
                                                        (self) => {
                                                            const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                                                            const handler = click.connect("pressed", player.next);
                                                            self.add_controller(click);
                                                            onCleanup(() =>{click.disconnect(handler)});
                                                        }
                                                    }
                                                >
                                                    <image iconSize={Gtk.IconSize.LARGE} iconName={PlayerButtonIcons.next} />
                                                </box>
                                            </box>
                                        </box>
                                    </box>
                                </box>
                            </popover> as Gtk.Popover}
                    >
                        <label label={player.statusText} widthChars={12}/>
                    </menubutton>
                );
            }}
        </With>
        </box>
    );
}
