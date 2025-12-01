import { Accessor, createEffect, createState, For, onCleanup, Setter } from "ags";
import { createPoll } from "ags/time";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { Awww } from "../services/Awww";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import settingsService from "../services/Settings";
import app from "ags/gtk4/app";
import Adw from "gi://Adw?version=1";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";

const path = GLib.get_home_dir() + "/.config/ags/wallpapers";
const pollTime = 240000;
const wallpaperPreviewSize = { width: 288, height:162 };
const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
];

class WallpaperSwitcherClass {
    private _activeWallpapers: Map<string, string>;
    private wallpapers: Accessor<Map<string, Gdk.Paintable>>;
    private setWallpapers: Setter<Map<string, Gdk.Paintable>>;
    private timerActive: Accessor<boolean>;
    private timer: Accessor<boolean>;

    constructor() {
        [this.wallpapers, this.setWallpapers] = createState<Map<string, Gdk.Paintable>>(new Map());
        this.timer = createPoll(true, pollTime, (prev) => !prev);
        this.timerActive = settingsService.wallpaperSelectorActive;
        this._activeWallpapers = new Map();
        this.scanForImages();
    }

    private isImageFile(filename: string) {
        const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
        return imageExtensions.includes(extension) ? extension : null;
    }

    private async scanForImages() {
        try {
            const dir = Gio.File.new_for_path(path);
            dir.enumerate_children_async("standard::name,standard::type", Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null,
                (result, source) => {
                    try {
                        const enumerator = result!.enumerate_children_finish(source);
                        this.proccessEnumerator(enumerator);
                    } catch (error) {
                        console.error("Error when looking for images: ", error);
                    }
                }
            );
        } catch(error) {
            console.error("Error when looking for images: ", error);
        }
    }

    private proccessEnumerator(enumerator: Gio.FileEnumerator) {
        try {
            const proccessFiles = () => {
                enumerator.next_files_async(4, GLib.PRIORITY_DEFAULT, null,
                    (result, source) => {
                        try {
                            const files = result!.next_files_finish(source);
                            if(files.length > 0) {
                                for(const file of files) {
                                    const fileName = file.get_name();
                                    if (!this.wallpapers.peek().has(fileName) && this.isImageFile(fileName)) {
                                        const file = Gio.File.new_for_path('wallpapers/' + fileName);
                                        file.read_async(GLib.PRIORITY_DEFAULT, null, (source, result) => {
                                            try {
                                                const stream = file.read_finish(result);

                                                GdkPixbuf.Pixbuf.new_from_stream_at_scale_async(
                                                    stream,
                                                    wallpaperPreviewSize.width,
                                                    wallpaperPreviewSize.height, true,
                                                    null,
                                                    (source, result) => {
                                                        try {
                                                            const pixbuf = GdkPixbuf.Pixbuf.new_from_stream_finish(result);
                                                            this.setWallpapers(prevMap => {
                                                                const newMap = new Map(prevMap);
                                                                newMap.set(fileName, Gdk.Texture.new_for_pixbuf(pixbuf));
                                                                return newMap;
                                                            });

                                                            stream.close(null);
                                                        } catch (error) {
                                                            console.error(`Error loading thumbnail for ${fileName}:`, error);
                                                        }
                                                    }
                                                );
                                            } catch (error) {
                                                console.error(`Error reading file ${fileName}:`, error);
                                            }
                                        });
                                    }
                                }
                                proccessFiles();
                            }
                        } catch(error) {
                            console.error("Error when looking for images: ", error);
                        }
                    }
                );
            }
            proccessFiles();
        } catch(error) {
            console.error("Error when proccessing images: ", error);
        }

    }

    public get activeWallpapers() {
        return this._activeWallpapers;
    }

    private wallpaperPreview({ fullPath, paintable, connector, setActiveWallpaper, activeWallpaper }: { fullPath: string, paintable: Gdk.Paintable, connector: string, setActiveWallpaper: Setter<string>, activeWallpaper: Accessor<string> }) {
        const isActive = activeWallpaper(wa => wa === fullPath);
        return (
            <button
                cssClasses={isActive( ia => ["Wallpaper", ia ? "Active" : ""])}
                onClicked={() => {
                    setActiveWallpaper(fullPath);
                    Awww.manager.setWallpaper(`${path}/${fullPath}`, { outputs: connector, transitionType: Awww.TransitionType.GROW });
                    app.toggle_window('ControlMenu ' + connector);
                }}
                overflow={Gtk.Overflow.HIDDEN}
            >
                <Adw.Clamp maximumSize={wallpaperPreviewSize.height} heightRequest={wallpaperPreviewSize.height}>
                    <Adw.Clamp maximumSize={wallpaperPreviewSize.width} widthRequest={wallpaperPreviewSize.width}>
                        <Gtk.Picture contentFit={Gtk.ContentFit.COVER} paintable={paintable} />
                    </Adw.Clamp>
                </Adw.Clamp>
            </button>
        );
    }

    private get randomImg() {
        const names = Array.from(this.wallpapers.peek().keys());
        return names[Math.floor(Math.random() * names.length)];
    }

    public WallpaperSwitcher(gdkmonitor: string) {
        const [activeWallpaper, setActiveWallpaper] = createState<string>("");
        createEffect(()=> {
            if(this.timerActive() && (this.timer() || true)) {
                const img = this.randomImg ?? Awww.manager.checkLastWallpaper(gdkmonitor);
                if(img) {
                    setActiveWallpaper(img);
                    Awww.manager.setWallpaper(`${path}/${activeWallpaper.peek()}`, { outputs: gdkmonitor, transitionType: Awww.TransitionType.GROW });
                }
            }
        });

        return (
            <box cssClasses={["WallpaperSwitcher"]} orientation={Gtk.Orientation.VERTICAL}>
                <box halign={Gtk.Align.CENTER}>
                    <label label={'Automatically switch wallpapers '} />
                    <switch
                        active={settingsService.wallpaperSelectorActive}
                        onStateSet={(src, val) => settingsService.setWallpaperSelectorActive = val}
                    />
                </box>
                <Adw.Carousel allowLongSwipes allowScrollWheel allowMouseDrag>
                    <For
                        each={this.wallpapers}
                        children={
                            img => this.wallpaperPreview({
                                fullPath: img[0],
                                paintable: img[1],
                                connector: gdkmonitor,
                                setActiveWallpaper:
                                setActiveWallpaper,
                                activeWallpaper: activeWallpaper }
                            )}
                    />
                </Adw.Carousel>
            </box>
        );
    }
}

const wallpaperSwitcher = new WallpaperSwitcherClass();

export default wallpaperSwitcher;
