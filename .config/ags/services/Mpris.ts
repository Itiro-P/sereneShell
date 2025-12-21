import { Accessor, createBinding, createState } from "ags";
import AstalMpris from "gi://AstalMpris?version=0.1";

export type PlayerButton = 'previous' | 'next' | 'playing' | 'paused' | 'stopped';

export const PlayerButtonIcons = {
    playing: "media-playback-start-symbolic",
    paused: "media-playback-pause-symbolic",
    stopped: "media-playback-stop-symbolic",
    next: "media-skip-forward-symbolic",
    previous: "media-skip-backward-symbolic"
}

export type MprisPlayerData = {
    active: boolean,
    title: Accessor<string>,
    artist: Accessor<string>,
    album: Accessor<string>,
    statusIcon: Accessor<string>,
    statusText: Accessor<string>,
    position: Accessor<number>,
    length: Accessor<number>,
    next: () => void,
    previous: () => void,
    playPause: () => void
}

class MprisManager {
    private mpris: AstalMpris.Mpris;
    private _activePlayerData: Accessor<MprisPlayerData>;
    private _activePlayer: Accessor<AstalMpris.Player | null>;
    private _players: Accessor<AstalMpris.Player[]>;
    private fallbackValues: MprisPlayerData;

    public constructor() {
        const [dummyStr, whySetYouStr] = createState<string>("");
        const [dummyN, whySetYouN] = createState<number>(0);
        this.fallbackValues = {
            active: false,
            title: dummyStr,
            artist: dummyStr,
            album: dummyStr,
            statusIcon: dummyStr,
            statusText: dummyStr,
            position: dummyN,
            length: dummyN,
            next: () => { },
            previous: () => { },
            playPause: () => { }
        };
        this.mpris = AstalMpris.get_default();
        this._players = createBinding(this.mpris, "players");
        this._activePlayer = this._players((players) => {
                let playing: AstalMpris.Player | null = null;
                let paused: AstalMpris.Player | null = null;

                for (const player of players) {
                    const status = player.get_playback_status();
                    if (status === AstalMpris.PlaybackStatus.PLAYING) {
                        playing = player;
                        break;
                    } else if (status === AstalMpris.PlaybackStatus.PAUSED) {
                        paused = player;
                    }
                }

                return playing || paused;
            }
        );
        this._activePlayerData = this._activePlayer((player) => {
            if (player !== null) {
                const status = createBinding(player, 'playbackStatus');
                const canGoNext = createBinding(player, 'canGoNext');
                const canGoPrevious = createBinding(player, 'canGoPrevious');
                const canPause = createBinding(player, 'canPause');
                const canPlay = createBinding(player, 'canPlay');

                return {
                    active: true,
                    title: createBinding(player, 'title'),
                    artist: createBinding(player, 'artist'),
                    album: createBinding(player, 'album'),
                    statusIcon: status(st => this.getPlayerStatusIcon(st === AstalMpris.PlaybackStatus.PLAYING ? 'paused' : 'playing')),
                    statusText: status(st => this.getPlayerStatus(st)),
                    position: createBinding(player, "position"),
                    length: createBinding(player, "length"),
                    next: () => { if(canGoNext.peek()) player.next() },
                    previous: () => { if(canGoPrevious.peek()) player!.previous() },
                    playPause: () => { if(canPause.peek() || canPlay.peek()) player!.play_pause() }
                };
            }

            return this.fallbackValues;
        });
    }

    public get playerStatus() {
        return this._activePlayerData(apd => apd.active);
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

    public get players() {
        return this._players;
    }

    public get activePlayer() {
        return this._activePlayer;
    }

    public get activePlayerData() {
        return this._activePlayerData;
    }
}

const mprisManager = new MprisManager;

export default mprisManager;
