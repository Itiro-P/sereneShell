import { Accessor, createBinding, With } from "ags";
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

class MediaClass {
    private mpris: AstalMpris.Mpris;
    private _activePlayerData: Accessor<PlayerData>;

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
            <box>
            <With value={this._activePlayerData}>
                {player => {
                    return (
                        <menubutton
                            alwaysShowArrow={false}
                            cssClasses={["Media"]}
                            sensitive={player.active}
                            popover={
                                <popover>
                                    <box cssClasses={["MprisPopover"]} orientation={Gtk.Orientation.VERTICAL}>
                                        <box cssClasses={["Metadata"]} orientation={Gtk.Orientation.VERTICAL}>
                                            <label cssClasses={["Title"]} label={player.title} ellipsize={3} maxWidthChars={15} widthChars={30} />
                                            <label cssClasses={["Artist"]} label={player.artist} ellipsize={3} maxWidthChars={15} widthChars={30} />
                                            <label cssClasses={["Album"]} label={player.album} ellipsize={3} maxWidthChars={15} widthChars={30} />
                                        </box>
                                        <box cssClasses={["Controllers"]} halign={Gtk.Align.CENTER}>
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
}

const media = new MediaClass;

export default media;
