import { Gtk, Gdk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { GLib, GObject, Variable, bind } from "astal";
import {  Overlay, Slider } from "astal/gtk4/widget";
import { Cava, CavaButton } from "./Cava";

type PlayerAction = 'previous' | 'next' | 'playpause';

type PlayerCss = 'playing' | 'paused' | 'stopped';

type PlayerTime = {
    position: number;
    duration: number;
}

type MediaStats = {
    currentState: Mpris.PlaybackStatus;
    currentCss: PlayerCss;
    lastPlayer: Mpris.Player | null;
    handlers: number[];
}

const PlayerButtonIcons = {
    playing: "media-playback-start-symbolic",
    paused: "media-playback-pause-symbolic",
    stop: "media-playback-stop-symbolic",
    next: "media-skip-forward-symbolic",
    previous: "media-skip-backward-symbolic"
}

export const mediaState = Variable<MediaStats>({
    currentState: Mpris.PlaybackStatus.STOPPED,
    currentCss: 'stopped',
    lastPlayer: null,
    handlers: []
});

const playerDuration = Variable<PlayerTime>({position: 0, duration: 0});
const progressPercent = Variable<number>(0);
const cava = Cava();

let updateTimeout: number | null = null;
let retryTimeout: number | null = null;
let positionTimer: number | null = null;
let savedPosition: number = 0;
let lastUpdateTime: number = 0;
const DEBOUNCE_DELAY = 100;
const RETRY_DELAY = 1000;
const MAX_RETRIES = 5;
const POSITION_UPDATE_INTERVAL = 1000;
let retryCount = 0;

const mpris = Mpris.get_default();

function formatState(state: Mpris.PlaybackStatus): string {
    switch (state) {
        case Mpris.PlaybackStatus.PLAYING:
            return "Tocando";
        case Mpris.PlaybackStatus.PAUSED:
            return "Pausado";
        case Mpris.PlaybackStatus.STOPPED:
            return "Nada tocando";
        default:
            return "Estado desconhecido";
    }
}

function formatTime(seconds: number): string {
    if (!seconds || seconds < 0) return "0:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

function updatePosition() {
    const player = mediaState.get().lastPlayer;
    if (!player || !isPlayerValid(player)) {
        playerDuration.set({duration: 0, position: 0});
        progressPercent.set(0);
        return;
    }

    try {

        savedPosition = player.position || 0;
        lastUpdateTime = Date.now();

        const duration = player.length || 0;

        playerDuration.set({duration: duration, position: savedPosition});

        if (duration > 0) {
            const percent = (savedPosition / duration) * 100;
            progressPercent.set(Math.min(100, Math.max(0, percent)));
        } else {
            progressPercent.set(0);
        }
    } catch (error) {
        console.warn("Erro ao atualizar posição:", error);
        playerDuration.set({duration: 0, position: 0});
        progressPercent.set(0);
    }
}

function startPositionTimer() {
    stopPositionTimer();

    const updateTimer = () => {
        const player = mediaState.get().lastPlayer;

        if (!player || player.playbackStatus !== Mpris.PlaybackStatus.PLAYING) {
            return;
        }

        const now = Date.now();
        const timeDiff = (now - lastUpdateTime) / 1000;
        savedPosition += timeDiff;
        lastUpdateTime = now;

        const duration = playerDuration.get().duration;

        playerDuration.set({...playerDuration.get(), position: savedPosition });

        if (duration > 0) {
            const percent = (savedPosition / duration) * 100;
            progressPercent.set(Math.min(100, Math.max(0, percent)));
        }

        positionTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, POSITION_UPDATE_INTERVAL, () => {
            updateTimer();
            return GLib.SOURCE_REMOVE;
        });
    };

    updateTimer();
}

function stopPositionTimer() {
    if (positionTimer) {
        GLib.source_remove(positionTimer);
        positionTimer = null;
    }
}

function disconnectFromPlayer() {
    const state = mediaState.get();

    if (updateTimeout) {
        GLib.source_remove(updateTimeout);
        updateTimeout = null;
    }

    if (retryTimeout) {
        GLib.source_remove(retryTimeout);
        retryTimeout = null;
    }

    stopPositionTimer();

    if (state.lastPlayer && state.handlers.length > 0) {
        state.handlers.forEach(handler => {
            if (state.lastPlayer && GObject.signal_handler_is_connected(state.lastPlayer, handler)) {
                try {
                    state.lastPlayer.disconnect(handler);
                } catch (error) {
                    console.warn("Erro ao desconectar handler:", error);
                }
            }
        });
    }

    mediaState.set({
        lastPlayer: null,
        handlers: [],
        currentCss: 'stopped',
        currentState: Mpris.PlaybackStatus.STOPPED
    });

    savedPosition = 0;
    lastUpdateTime = 0;
    playerDuration.set({duration: 0, position: 0});
    progressPercent.set(0);
}

function isPlayerValid(player: Mpris.Player): boolean {
    if (!player) return false;

    try {
        const busName = player.busName;
        return !!(busName && busName.length > 0);
    } catch (error) {
        console.warn("Player inválido detectado:", error);
        return false;
    }
}

function connectToPlayer(player: Mpris.Player) {
    if (!isPlayerValid(player)) {
        console.warn("Tentativa de conectar a player inválido");
        return;
    }

    disconnectFromPlayer();
    retryCount = 0;

    const handlers: number[] = [];

    try {
        handlers.push(
            player.connect("notify::playback-status", () => {
                updateMediaState(player);
                if (player.playbackStatus === Mpris.PlaybackStatus.PLAYING) {
                    startPositionTimer();
                } else {
                    stopPositionTimer();
                    updatePosition();
                }
            }),
            player.connect("notify::title", () => updateMediaState(player)),
            player.connect("notify::artist", () => updateMediaState(player)),
            player.connect("notify::metadata", () => {
                updateMediaState(player);
                updatePosition();
            })
        );

        mediaState.set({
            ...mediaState.get(),
            lastPlayer: player,
            handlers: handlers
        });

        updateMediaState(player);
        updatePosition();

        if (player.playbackStatus === Mpris.PlaybackStatus.PLAYING) {
            startPositionTimer();
        }
    } catch (error) {
        console.error("Erro ao conectar aos sinais do player:", error);
        handlers.forEach(handler => {
            try {
                if (GObject.signal_handler_is_connected(player, handler)) player.disconnect(handler);
            } catch(error) {
                console.error("Erro ao desconectar o handler:", error);
            }
        });
    }
}

function updateMediaState(player: Mpris.Player | null) {
    if (updateTimeout) {
        GLib.source_remove(updateTimeout);
        updateTimeout = null;
    }

    updateTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, DEBOUNCE_DELAY, () => {
        executeUpdateMediaState(player);
        updateTimeout = null;
        return GLib.SOURCE_REMOVE;
    });
}

function executeUpdateMediaState(player: Mpris.Player | null) {
    if (!player) {
        mediaState.set({
            ...mediaState.get(),
            currentCss: 'stopped',
            currentState: Mpris.PlaybackStatus.STOPPED
        });
        return;
    }

    if (!isPlayerValid(player)) {
        const nextPlayer = findBestPlayer();
        if (nextPlayer && nextPlayer !== player) {
            connectToPlayer(nextPlayer);
            return;
        } else {
            mediaState.set({
                ...mediaState.get(),
                currentCss: 'stopped',
                currentState: Mpris.PlaybackStatus.STOPPED
            });
            return;
        }
    }

    try {
        const title = player.title || "Título desconhecido";
        const artist = player.artist || "Artista desconhecido";
        const status = player.playbackStatus;

        switch (status) {
            case Mpris.PlaybackStatus.PLAYING:
                mediaState.set({
                    ...mediaState.get(),
                    currentCss: 'playing',
                    currentState: Mpris.PlaybackStatus.PLAYING
                });
                break;
            case Mpris.PlaybackStatus.PAUSED:
                mediaState.set({
                    ...mediaState.get(),
                    currentCss: 'paused',
                    currentState: Mpris.PlaybackStatus.PAUSED
                });
                break;
            case Mpris.PlaybackStatus.STOPPED:
            default:
                mediaState.set({
                    ...mediaState.get(),
                    currentCss: 'stopped',
                    currentState: Mpris.PlaybackStatus.STOPPED
                });
                break;
        }
    } catch (error) {
        console.warn("Erro ao acessar propriedades do player MPRIS:", error);
        const nextPlayer = findBestPlayer();
        if (nextPlayer && nextPlayer !== player) {
            connectToPlayer(nextPlayer);
        } else {
            mediaState.set({
                ...mediaState.get(),
                currentCss: 'stopped',
                currentState: Mpris.PlaybackStatus.STOPPED
            });
        }
    }
}

function findBestPlayer(): Mpris.Player | null {
    try {
        const players = mpris.players;

        if (players.length === 0) return null;

        const validPlayers = players.filter(p => {
            const valid = isPlayerValid(p);
            return valid;
        });

        if (validPlayers.length === 0) return null;

        const playingPlayer = validPlayers.find(p => {
            try { return p.playbackStatus === Mpris.PlaybackStatus.PLAYING; }
            catch { return false; }
        });

        if (playingPlayer) return playingPlayer;

        const pausedPlayer = validPlayers.find(p => {
            try { return p.playbackStatus === Mpris.PlaybackStatus.PAUSED; }
            catch { return false; }
        });

        if (pausedPlayer) return pausedPlayer;
        return validPlayers[0];
    } catch (error) {
        console.error("Erro ao buscar players:", error);
        return null;
    }
}

function initializeMpris() {
    const tryInitialize = () => {
        const initialPlayer = findBestPlayer();
        if (initialPlayer) {
            connectToPlayer(initialPlayer);
            retryCount = 0;
        } else {
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                const delay = RETRY_DELAY * retryCount;
                retryTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
                    tryInitialize();
                    retryTimeout = null;
                    return GLib.SOURCE_REMOVE;
                });
            }
        }
    }

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        tryInitialize();
        return GLib.SOURCE_REMOVE;
    });
}

let mprisHandlers: number[] = [];

function setupMprisHandlers() {
    try {
        mprisHandlers = [
            mpris.connect("player-added", (_, player: Mpris.Player) => {
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
                    const currentPlayer = mediaState.get().lastPlayer;

                    if (!currentPlayer || !isPlayerValid(currentPlayer)) {
                        connectToPlayer(player);
                    } else {
                        try {
                            if (isPlayerValid(player) && player.playbackStatus === Mpris.PlaybackStatus.PLAYING) {
                                connectToPlayer(player);
                            }
                        } catch (error) {
                            console.warn("Erro ao verificar status do novo player:", error);
                        }
                    }
                    return GLib.SOURCE_REMOVE;
                });
            }),

            mpris.connect("player-closed", (_, player: Mpris.Player) => {
                const currentPlayer = mediaState.get().lastPlayer;

                if (currentPlayer === player) {
                    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                        const nextPlayer = findBestPlayer();
                        if (nextPlayer) connectToPlayer(nextPlayer);
                        else disconnectFromPlayer();
                        return GLib.SOURCE_REMOVE;
                    });
                }
            })
        ];
    } catch (error) {
        console.error("Erro ao configurar handlers MPRIS:", error);
    }
}

const setupButton = (action: PlayerAction) => (self: Gtk.Widget) => {
    const click = new Gtk.GestureClick();
    click.set_button(Gdk.BUTTON_PRIMARY);

    const clickHandler = click.connect("pressed", () => {
        const player = mediaState.get().lastPlayer;
        if (!player || !isPlayerValid(player)) {
            console.warn("Player inválido ou inexistente");
            return;
        }

        try {
            switch (action) {
                case 'previous':
                    if (player.canGoPrevious) player.previous();
                    break;
                case 'next':
                    if (player.canGoNext) player.next();
                    break;
                case 'playpause':
                    if (player.canPlay || player.canPause) player.play_pause();
                    break;
            }

            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                executeUpdateMediaState(player);
                return GLib.SOURCE_REMOVE;
            });
        } catch (error) {
            console.warn(`Erro ao executar ação ${action}:`, error);
            const nextPlayer = findBestPlayer();
            if (nextPlayer) connectToPlayer(nextPlayer);
        }
    });

    self.add_controller(click);
    (self as any)._clickHandler = clickHandler;
    (self as any)._clickController = click;
};

function PlayerSlider() {
    return (
        <box cssClasses={["PlayerSlider"]}>
            <Slider cssClasses={["Slider"]} value={bind(progressPercent)} min={0} max={100} step={1} sensitive={false} drawValue={false} />
            <label cssClasses={["TimeLabel"]} label={bind(playerDuration).as(pd => `${formatTime(pd.position)} / ${formatTime(pd.duration)}`)} />
        </box>
    );
}

function PlayerInfo() {
    return (
        <box cssClasses={["PlayerInfo"]} orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>
            <box cssClasses={["Info"]} orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>
                <label cssClasses={["Title"]} label={bind(mediaState).as(c => c.lastPlayer?.title ?? "")} ellipsize={3} maxWidthChars={15} widthChars={30} />
                <label cssClasses={["Artist"]} label={bind(mediaState).as(c => c.lastPlayer?.artist ?? "")} ellipsize={3} maxWidthChars={15} widthChars={30} />
                <label cssClasses={["Album"]} label={bind(mediaState).as(c => c.lastPlayer?.album ?? "")} ellipsize={3} maxWidthChars={15} widthChars={30} />
            </box>
            <box cssClasses={["LowerPart"]} halign={Gtk.Align.CENTER} orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>
                <PlayerSlider />
                <box cssClasses={["Controllers"]} halign={Gtk.Align.CENTER}>
                    <box
                        cssClasses={["Previous"]}
                        setup={setupButton('previous')}
                        sensitive={bind(mediaState).as(c => c.lastPlayer?.canGoPrevious ?? false)}
                        child={<image iconSize={Gtk.IconSize.LARGE} iconName={PlayerButtonIcons.previous} />}
                    />
                    <box
                        cssClasses={["PlayPause"]}
                        setup={setupButton('playpause')}
                        sensitive={bind(mediaState).as(c => (c.lastPlayer?.canPlay && c.lastPlayer?.canPause) ?? false)}
                        child={<image iconSize={Gtk.IconSize.LARGE} iconName={bind(mediaState).as(c => c.lastPlayer?.playbackStatus === Mpris.PlaybackStatus.PLAYING ? PlayerButtonIcons.paused : PlayerButtonIcons.playing)} />}
                    />
                    <box
                        cssClasses={["Next"]}
                        setup={setupButton('next')}
                        sensitive={bind(mediaState).as(c => c.lastPlayer?.canGoNext ?? false)}
                        child={<image iconSize={Gtk.IconSize.LARGE} iconName={PlayerButtonIcons.next} />}
                    />
                </box>
            </box>
        </box>
    );
}

function MprisInfo() {
    return (<label cssClasses={["MprisInfo"]} label={bind(mediaState).as(c => formatState(c.currentState))} widthChars={12}/>);
}

export function MprisPlayer() {
    return (
        <Overlay
            cssClasses={["MprisPlayer"]}
            setup={
                (self: Gtk.Overlay) => {
                    const playerInfo = PlayerInfo();

                    self.set_child(cava);
                    self.add_overlay(playerInfo);
                    self.set_measure_overlay(playerInfo, true);
                    self.set_clip_overlay(playerInfo, false);
                }
            }
            onDestroy={() => {
                if(mprisHandlers.length > 0) {
                    mpris.disconnect(mprisHandlers[0]);
                    mpris.disconnect(mprisHandlers[1]);
                }
            }}
            overflow={Gtk.Overflow.HIDDEN}
        />
    );
}

export default function Media() {
    setupMprisHandlers();
    initializeMpris();

    return (
        <box cssClasses={["Media"]}>
            <menubutton
                hexpand
                alwaysShowArrow={false}
                sensitive={bind(mediaState).as(c => c.lastPlayer !== null)}
                child={<MprisInfo />}
                popover={<popover child={<MprisPlayer />} /> as Gtk.Popover}
            />
            <CavaButton />
        </box>
    );
}
