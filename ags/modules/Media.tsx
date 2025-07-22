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

function getPlayerStatusIcon(status: PlayerButton) {
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

const mpris = AstalMpris.get_default();

const activePlayer = createBinding(mpris, "players").as(
    (players) => {
        for(const player of players) {
            if(player.get_playback_status() === AstalMpris.PlaybackStatus.PLAYING) {
                return player;
            } else if(player.get_playback_status() === AstalMpris.PlaybackStatus.PAUSED) {
                return player;
            }
        }
        return null;
    }
);

const playerData = activePlayer.as(ap => {
    if(ap !== null) {
        const status = createBinding(ap!, 'playbackStatus');
        const canControl = createBinding(ap!, 'canControl');
        return {
            active: true,
            title: createBinding(ap!, 'title'),
            artist: createBinding(ap!, 'artist'),
            album: createBinding(ap!, 'album'),
            statusIcon: status.as(st => getPlayerStatusIcon(st === AstalMpris.PlaybackStatus.PLAYING ? 'paused' : 'playing')),
            statusText: status.as(st => getPlayerStatus(st)),
            next: () => ap!.next(),
            previous: () => ap!.previous(),
            playPause: () => ap!.play_pause()
        };
    }
    return {
        active: false,
        title: '',
        artist: '',
        album: '',
        statusIcon: PlayerButtonIcons.stopped,
        statusText: getPlayerStatus(AstalMpris.PlaybackStatus.STOPPED),
        next: () => {},
        previous: () => {},
        playPause: () => {}
    };
});

export default function Media() {

    return (
        <box>
        <With value={playerData}>
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
                                                            const handler = click.connect("pressed", () => player.previous());
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
                                                            const handler = click.connect("pressed", () => player.playPause());
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
                                                            const handler = click.connect("pressed", () => player.next());
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
