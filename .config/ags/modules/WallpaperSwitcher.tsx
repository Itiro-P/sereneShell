import { Accessor, createEffect, createState, For } from "ags";
import { Awww } from "../services/Awww";
import { Gdk, Gtk } from "ags/gtk4";
import { settingsService } from "../services";
import Adw from "gi://Adw?version=1";
import { wallpapersService, PREVIEW_SIZE_WALLPAPERS } from "../services/Wallpapers";

export namespace WallpaperSwitcher {
    export function WallpaperItem(props: {
        fullPath: string,
        paintable: Gdk.Paintable,
        connector: string,
        isActive: Accessor<boolean>,
        onClick: () => void
    }) {
        return (
            <button
                cssClasses={props.isActive(ia => ["Wallpaper",  ia ? "Active" : ""])}
                onClicked={props.onClick}
                overflow={Gtk.Overflow.HIDDEN}
            >
                <Adw.Clamp maximumSize={PREVIEW_SIZE_WALLPAPERS.height} heightRequest={PREVIEW_SIZE_WALLPAPERS.height}>
                    <Adw.Clamp maximumSize={PREVIEW_SIZE_WALLPAPERS.width} widthRequest={PREVIEW_SIZE_WALLPAPERS.width}>
                        <Gtk.Picture contentFit={Gtk.ContentFit.COVER} paintable={props.paintable} />
                    </Adw.Clamp>
                </Adw.Clamp>
            </button>
        );
    }

    export function WallpaperSwitcher({ gdkmonitor }: { gdkmonitor: string }) {
        const [activeWallpaper, setActiveWallpaper] = createState<string>("");
        let carousel!: Adw.Carousel;

        createEffect(() => {
            const tick = wallpapersService.timer();

            if (!settingsService.wallpaperSelectorActive.peek()) return;

            Awww.manager.checkLastWallpaper(gdkmonitor).then(() => {
                const nextImg = wallpapersService.randomImg;
                if (nextImg && nextImg !== activeWallpaper.peek()) {
                    setActiveWallpaper(nextImg);
                    Awww.manager.setWallpaper(nextImg, {
                        outputs: gdkmonitor,
                        transitionType: Awww.TransitionType.GROW
                    });
                }
            });
        });

        return (
            <box cssClasses={["WallpaperSwitcher"]} orientation={Gtk.Orientation.VERTICAL}>
                <box halign={Gtk.Align.CENTER} spacing={12}>
                    <label label={'Automatically switch wallpapers'} />
                    <switch
                        active={settingsService.wallpaperSelectorActive}
                        onStateSet={(_, val) => settingsService.setWallpaperSelectorActive = val}
                    />
                </box>
                <Adw.Carousel
                    allowLongSwipes
                    allowScrollWheel
                    allowMouseDrag
                    $={self => carousel = self}
                >
                    <For
                        each={wallpapersService.wallpapers}
                        children={([path, paintable]) => WallpaperItem({
                            fullPath: path,
                            paintable: paintable,
                            connector: gdkmonitor,
                            isActive: activeWallpaper(aw => aw === path),
                            onClick: () => {
                                setActiveWallpaper(path);
                                Awww.manager.setWallpaper(path, {
                                    outputs: gdkmonitor,
                                    transitionType: Awww.TransitionType.GROW
                                });
                            }
                        })}
                    />
                </Adw.Carousel>
            </box>
        );
    }
}
