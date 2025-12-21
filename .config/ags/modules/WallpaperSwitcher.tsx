import { Accessor, createEffect, createState, For, Setter } from "ags";
import { createPoll } from "ags/time";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { Awww } from "../services/Awww";
import { Gdk, Gtk } from "ags/gtk4";
import settingsService from "../services/Settings";
import app from "ags/gtk4/app";
import Adw from "gi://Adw?version=1";
import Gly from "gi://Gly?version=2";
import GlyGtk4 from "gi://GlyGtk4?version=2";

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
    private _frameRequest: Gly.FrameRequest;
    private wallpapers: Accessor<Map<string, Gdk.Paintable>>;
    private setWallpapers: Setter<Map<string, Gdk.Paintable>>;
    private timerActive: Accessor<boolean>;
    private timer: Accessor<boolean>;

    constructor() {
        [this.wallpapers, this.setWallpapers] = createState<Map<string, Gdk.Paintable>>(new Map());
        this.timer = createPoll(true, pollTime, (prev) => !prev);
        this.timerActive = settingsService.wallpaperSelectorActive;
        this._activeWallpapers = new Map();
        this._frameRequest = new Gly.FrameRequest();
        this._frameRequest.set_scale(
            wallpaperPreviewSize.width,
            wallpaperPreviewSize.height
        );
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

    private async proccessEnumerator(enumerator: Gio.FileEnumerator) {
        try {
            const proccessFiles = () => {
                enumerator.next_files_async(4, GLib.PRIORITY_DEFAULT, null,
                    (result, source) => {
                        try {
                            const files = result!.next_files_finish(source);
                            if(files.length > 0) {
                                for(const file of files) this.loadImage(file);
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

    private async loadImage(file: Gio.FileInfo) {
        const fileName = file.get_name();
        const fullPath = `${path}/${fileName}`;
        if (this.isImageFile(fileName) && !this.wallpapers.peek().has(fullPath)) {
            const loader = Gly.Loader.new(Gio.File.new_for_path(fullPath));
            loader.load_async(null, (loaderObj, result) => {
                let image: Gly.Image;
                try {
                    image = loaderObj!.load_finish(result);
                } catch(error) {
                    console.error("Error when loading image: ", error);
                    return;
                }

                image.get_specific_frame_async(this._frameRequest, null,
                    (imageObj, result) => {
                        let frame: Gly.Frame;
                        try {
                            frame = imageObj!.get_specific_frame_finish(result);
                        } catch (e) {
                            console.warn("Failed to get frame", e);
                            return;
                        }
                        this.setWallpapers(prev => {
                            const map = new Map(prev);
                            map.set(fullPath, GlyGtk4.frame_get_texture(frame));
                            return map;
                        });
                    }
                );
            });
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
                    Awww.manager.setWallpaper(fullPath, { outputs: connector, transitionType: Awww.TransitionType.GROW });
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
                Awww.manager.checkLastWallpaper(gdkmonitor).then(img => {
                    const finalImg = this.randomImg ?? img;
                    if(finalImg) {
                        setActiveWallpaper(finalImg);
                        Awww.manager.setWallpaper(`${activeWallpaper.peek()}`, { outputs: gdkmonitor, transitionType: Awww.TransitionType.GROW });
                    }
                });
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
                                activeWallpaper: activeWallpaper })
                        }
                    />
                </Adw.Carousel>
            </box>
        );
    }
}

const wallpaperSwitcher = new WallpaperSwitcherClass();

export default wallpaperSwitcher;
