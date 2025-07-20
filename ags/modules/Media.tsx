import { Accessor, createBinding, createComputed, createConnection, createExternal, createState, onCleanup, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import AstalMpris from "gi://AstalMpris?version=0.1";

type PlayerAction = 'previous' | 'next' | 'playpause';

const PlayerButtonIcons = {
    playing: "media-playback-start-symbolic",
    paused: "media-playback-pause-symbolic",
    stop: "media-playback-stop-symbolic",
    next: "media-skip-forward-symbolic",
    previous: "media-skip-backward-symbolic"
}

const mpris = AstalMpris.get_default();

const activePlayer = createComputed([createBinding(mpris, "players")],
    (players) => {
        let playing: AstalMpris.Player | null = null;
        let paused: AstalMpris.Player | null = null;
        for(const player of players) {
            if(player.get_playback_status() === AstalMpris.PlaybackStatus.PLAYING) {
                playing = player;
            } else if(player.get_playback_status() === AstalMpris.PlaybackStatus.PAUSED) {
                paused = player;
            }
        }
        return playing || paused;
    }
);

function getPlayerStatus(status: AstalMpris.PlaybackStatus) {
    switch(status) {
        case AstalMpris.PlaybackStatus.PLAYING:
            return 'Tocando';
        case AstalMpris.PlaybackStatus.PAUSED:
            return 'Pausado';
        default:
            return 'Nada tocando';
    }
}
/*
function createPlayerPosition(player: AstalMpris.Player | null): Accessor<number> {
    if (!player) {
        return createState(0)[0]
    }

    const basePosition = createBinding(player, 'position');
    const playbackStatus = createBinding(player, 'playbackStatus');

    return createExternal(
        basePosition.get(),
        (set) => {
            let timer: GLib.Source | null = null;

            const unsubscribePosition = basePosition.subscribe(() => {
                set(basePosition.get())
            });

            const unsubscribeStatus = playbackStatus.subscribe(() => {
                const isPlaying = playbackStatus.get() === AstalMpris.PlaybackStatus.PLAYING;

                if (isPlaying && !timer) {
                    timer = setInterval(() => {
                        set(prev => prev + 1);
                    }, 1000);
                } else if (!isPlaying && timer) {
                    clearInterval(timer);
                    timer = null;
                }
            });

            return () => {
                unsubscribePosition();
                unsubscribeStatus();
                if (timer) {
                    clearInterval(timer);
                }
            };
        }
    );
}

function PlayerSlider() {
    return (
        <With value={activePlayer}>
            {player => {
                const hasPlayer = player !== null;
                const position = createPlayerPosition(player);
                const length = hasPlayer ? createBinding(player, 'length') : createState(0)[0];
                const formattedPosition = position.as(pos => formatTime(pos));
                const formattedLength = length.as(len => formatTime(len));
                const formattedOutput = createComputed([formattedLength, formattedPosition], (fl, fp) => `${fp} / ${fl}`);
                return (
                    <box cssClasses={["PlayerSlider"]} hexpand>
                        <slider cssClasses={["Slider"]} value={position} min={0} max={length} step={1} sensitive={false} drawValue />
                        <label cssClasses={["TimeLabel"]} label={formattedOutput} />
                    </box>
                );
            }}
        </With>
    );
}
*/
function MprisPlayer() {
    return (
        <With value={activePlayer}>
            {player => {
                const hasPlayer = player !== null;
                const title = hasPlayer ? createBinding(player, 'title') : '';
                const artist = hasPlayer ? createBinding(player, 'artist') : '';
                const album = hasPlayer ? createBinding(player, 'album') : '';
                const statusIcon = hasPlayer ? createComputed(
                    [createBinding(player, 'playback_status')],
                        (status) => status === AstalMpris.PlaybackStatus.PLAYING ? PlayerButtonIcons.paused : PlayerButtonIcons.playing
                ) : createState(PlayerButtonIcons.stop)[0];

                return (
                    <box cssClasses={["MprisPlayer"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["Metadata"]} orientation={Gtk.Orientation.VERTICAL}>
                            <label cssClasses={["Title"]} label={title} ellipsize={3} maxWidthChars={15} widthChars={30} />
                            <label cssClasses={["Artist"]} label={artist} ellipsize={3} maxWidthChars={15} widthChars={30} />
                            <label cssClasses={["Album"]} label={album} ellipsize={3} maxWidthChars={15} widthChars={30} />
                        </box>
                        <box cssClasses={["LowerPart"]} orientation={Gtk.Orientation.VERTICAL}>
                            {/* <PlayerSlider /> */}
                            <box cssClasses={["Controllers"]} halign={Gtk.Align.CENTER}>
                                <box cssClasses={["Previous"]} sensitive={hasPlayer}
                                    $={
                                        (self) => {
                                            const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                                            const handler = click.connect("pressed", () => {if(hasPlayer && player.get_can_go_previous()) player.previous()});
                                            self.add_controller(click);
                                            onCleanup(() =>{click.disconnect(handler)});
                                        }
                                    }
                                >
                                    <image iconSize={Gtk.IconSize.LARGE} iconName={PlayerButtonIcons.previous} />
                                </box>
                                <box cssClasses={["PlayPause"]} sensitive={hasPlayer}
                                    $={
                                        (self) => {
                                            const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                                            const handler = click.connect("pressed", () => {if(hasPlayer && player.get_can_control()) player.play_pause()});
                                            self.add_controller(click);
                                            onCleanup(() =>{click.disconnect(handler)});
                                        }
                                    }
                                >
                                    <image iconSize={Gtk.IconSize.LARGE} iconName={statusIcon} />
                                </box>
                                <box cssClasses={["Next"]} sensitive={hasPlayer}
                                    $={
                                        (self) => {
                                            const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                                            const handler = click.connect("pressed", () => {if(hasPlayer && player.get_can_go_next()) player.next()});
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
                );
            }}
        </With>
    );
}
function MprisPopover() {
    return (
        <overlay
            cssClasses={["MprisPopover"]}
            overflow={Gtk.Overflow.HIDDEN}
        >
            <MprisPlayer />
        </overlay>
    );
}
export default function Media() {
    return (
        <menubutton
            alwaysShowArrow={false}
            cssClasses={["Media"]}
            sensitive={activePlayer.as(ac => ac !== null)}
            popover={<popover><MprisPopover /></popover> as Gtk.Popover}
        >
            <With value={activePlayer}>
                {player => {
                    const hasPlayer = player !== null;
                    const status = hasPlayer ? createBinding(player, "playback_status") : createState(AstalMpris.PlaybackStatus.STOPPED)[0];
                    return <label label={createComputed([status], (st) => getPlayerStatus(st))} widthChars={12}/>
                }}
            </With>
        </menubutton>
    );
}
