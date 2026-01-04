import { Accessor, createBinding, createState, Setter } from "ags";
import AstalMpris from "gi://AstalMpris?version=0.1";

export type PlayerButton = 'previous' | 'next' | 'playing' | 'paused' | 'stopped';

export const PlayerButtonIcons = {
    playing: "media-playback-start-symbolic",
    paused: "media-playback-pause-symbolic",
    stopped: "media-playback-stop-symbolic",
    next: "media-skip-forward-symbolic",
    previous: "media-skip-backward-symbolic"
}

class Mpris {
    private mpris: AstalMpris.Mpris;
    private _activePlayer: Accessor<AstalMpris.Player>;
    private _players: Accessor<AstalMpris.Player[]>;
    private _dummyPlayer: AstalMpris.Player;
    private _isPlayerActive: Accessor<boolean>;
    private _setIsPlayerActive: Setter<boolean>;

    public constructor() {
        [this._isPlayerActive, this._setIsPlayerActive] = createState(false);
        this.mpris = AstalMpris.get_default();
        this._players = createBinding(this.mpris, "players")(ps => ps.filter(p => !this.isDummy(p)));
        this._dummyPlayer = new AstalMpris.Player();
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
            const final = playing || paused;
            if(final) {
                this._setIsPlayerActive(true);
                return final;
            }
            this._setIsPlayerActive(false);
            return this._dummyPlayer;
        });
    }

    public playerStatusStr(status: AstalMpris.PlaybackStatus) {
        switch(status) {
            case AstalMpris.PlaybackStatus.PLAYING:
                return 'Playing';
            case AstalMpris.PlaybackStatus.PAUSED:
                return 'Paused';
            default:
                return 'Nothing Playing';
        }
    }

    public playerStatusIcon(status: PlayerButton) {
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

    private isDummy(player: AstalMpris.Player) {
        return player === this._dummyPlayer;
    }

    public get isPlayerActive() {
        return this._isPlayerActive;
    }

    public get players() {
        return this._players;
    }

    public get activePlayer() {
        return this._activePlayer;
    }
}

export const mprisService = new Mpris;
