import { Accessor, createEffect, createState, For, Setter } from "ags";
import { createPoll } from "ags/time";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { Awww } from "../services/Awww";
import { Gdk, Gtk } from "ags/gtk4";
import { settingsService } from "../services";
import Adw from "gi://Adw?version=1";
import Gly from "gi://Gly?version=2";
import GlyGtk4 from "gi://GlyGtk4?version=2";

const WALLPAPER_DIR = GLib.get_home_dir() + "/.config/ags/wallpapers";
const POLL_TIME = 240000;
const PREVIEW_SIZE = { width: 288, height: 162 };
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function listDirAsync(path: string): Promise<Gio.FileInfo[]> {
    return new Promise((resolve, reject) => {
        const file = Gio.File.new_for_path(path);
        file.enumerate_children_async(
            "standard::name,standard::type",
            Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
            GLib.PRIORITY_DEFAULT,
            null,
            (obj, res) => {
                try {
                    const enumerator = obj!.enumerate_children_finish(res);
                    const allFiles: Gio.FileInfo[] = [];

                    const next = () => {
                        enumerator.next_files_async(10, GLib.PRIORITY_DEFAULT, null, (eObj, eRes) => {
                            try {
                                const files = eObj!.next_files_finish(eRes);
                                if (files.length === 0) {
                                    resolve(allFiles);
                                    return;
                                }
                                allFiles.push(...files);
                                next();
                            } catch (e) {
                                reject(e);
                            }
                        });
                    };
                    next();
                } catch (e) {
                    reject(e);
                }
            }
        );
    });
}

function loadTextureAsync(fullPath: string, req: Gly.FrameRequest): Promise<Gdk.Texture> {
    return new Promise((resolve, reject) => {
        const loader = Gly.Loader.new(Gio.File.new_for_path(fullPath));
        loader.load_async(null, (l, res) => {
            try {
                const image = l!.load_finish(res);
                image.get_specific_frame_async(req, null, (i, iRes) => {
                    try {
                        const frame = i!.get_specific_frame_finish(iRes);
                        resolve(GlyGtk4.frame_get_texture(frame));
                    } catch (e) { reject(e); }
                });
            } catch (e) { reject(e); }
        });
    });
}

class WallpaperSwitcherClass {
    private wallpapers: Accessor<Map<string, Gdk.Paintable>>;
    private setWallpapers: Setter<Map<string, Gdk.Paintable>>;
    private _wallpaperWidgets: Map<string, Gtk.Widget> = new Map();
    private _frameRequest: Gly.FrameRequest;

    private timer: Accessor<number>;

    constructor() {
        [this.wallpapers, this.setWallpapers] = createState<Map<string, Gdk.Paintable>>(new Map());
        this.timer = createPoll(0, POLL_TIME, (prev) => prev + 1);

        this._frameRequest = new Gly.FrameRequest();
        this._frameRequest.set_scale(PREVIEW_SIZE.width, PREVIEW_SIZE.height);

        this.initWallpapers();
    }

    private isImageFile(filename: string): boolean {
        const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
        return IMAGE_EXTENSIONS.has(ext);
    }

    private async initWallpapers() {
        try {
            const files = await listDirAsync(WALLPAPER_DIR);
            const newMap = new Map<string, Gdk.Paintable>();

            const loadPromises = files.map(async (file) => {
                const name = file.get_name();
                if (!this.isImageFile(name)) return;

                const fullPath = `${WALLPAPER_DIR}/${name}`;
                try {
                    const texture = await loadTextureAsync(fullPath, this._frameRequest);
                    newMap.set(fullPath, texture);
                } catch (e) {
                    console.warn(`Failed to load wallpaper: ${name}`, e);
                }
            });

            await Promise.all(loadPromises);

            this.setWallpapers(newMap);
            console.log(`Loaded ${newMap.size} wallpapers.`);

        } catch (error) {
            console.error("Critical error scanning wallpapers:", error);
        }
    }

    private get randomImg(): string | null {
        const keys = Array.from(this.wallpapers.peek().keys());
        if (keys.length === 0) return null;
        return keys[Math.floor(Math.random() * keys.length)];
    }

    private WallpaperItem = (props: {
        fullPath: string,
        paintable: Gdk.Paintable,
        connector: string,
        isActive: boolean,
        onClick: () => void
    }) => {
        return (
            <button
                cssClasses={["Wallpaper", props.isActive ? "Active" : ""]}
                $={self => this._wallpaperWidgets.set(props.fullPath, self)}
                onClicked={props.onClick}
                overflow={Gtk.Overflow.HIDDEN}
            >
                <Adw.Clamp maximumSize={PREVIEW_SIZE.height} heightRequest={PREVIEW_SIZE.height}>
                    <Adw.Clamp maximumSize={PREVIEW_SIZE.width} widthRequest={PREVIEW_SIZE.width}>
                        <Gtk.Picture contentFit={Gtk.ContentFit.COVER} paintable={props.paintable} />
                    </Adw.Clamp>
                </Adw.Clamp>
            </button>
        );
    }

    public WallpaperSwitcher = ({ gdkmonitor }: { gdkmonitor: string }) => {
        const [activeWallpaper, setActiveWallpaper] = createState<string>("");
        let carousel!: Adw.Carousel;

        createEffect(() => {
            const tick = this.timer();

            if (!settingsService.wallpaperSelectorActive.peek()) return;

            Awww.manager.checkLastWallpaper(gdkmonitor).then(() => {
                const nextImg = this.randomImg;
                if (nextImg && nextImg !== activeWallpaper.peek()) {
                    setActiveWallpaper(nextImg);
                    Awww.manager.setWallpaper(nextImg, {
                        outputs: gdkmonitor,
                        transitionType: Awww.TransitionType.GROW
                    });

                    const widget = this._wallpaperWidgets.get(nextImg);
                    if (widget && carousel) {
                        carousel.scroll_to(widget, true);
                    }
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
                        each={this.wallpapers}
                        children={([path, paintable]) => this.WallpaperItem({
                            fullPath: path,
                            paintable: paintable,
                            connector: gdkmonitor,
                            isActive: activeWallpaper() === path,
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

const wallpaperSwitcher = new WallpaperSwitcherClass();
export default wallpaperSwitcher;
