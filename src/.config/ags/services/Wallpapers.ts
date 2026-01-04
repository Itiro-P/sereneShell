import { Accessor, createState, For, Setter } from "ags";
import { createPoll } from "ags/time";
import GLib from "gi://GLib?version=2.0";
import { Gdk, Gtk } from "ags/gtk4";
import Gly from "gi://Gly?version=2";
import { imageService } from "./Image";

const WALLPAPER_DIR = GLib.get_home_dir() + "/.config/ags/wallpapers";
const POLL_TIME = 240000;
export const PREVIEW_SIZE_WALLPAPERS = { width: 288, height: 162 };
const frameRequestWallpapers = new Gly.FrameRequest;
frameRequestWallpapers.set_scale(PREVIEW_SIZE_WALLPAPERS.width, PREVIEW_SIZE_WALLPAPERS.height);

class WallpapersClass {
    private _wallpapers: Accessor<Map<string, Gdk.Paintable>>;
    private _setWallpapers: Setter<Map<string, Gdk.Paintable>>;
    private _timer: Accessor<number>;

    constructor() {
        [this._wallpapers, this._setWallpapers] = createState<Map<string, Gdk.Paintable>>(new Map());
        this._timer = createPoll(0, POLL_TIME, (prev) => prev + 1);

        this.initWallpapers();
    }

    private async initWallpapers() {
        try {
            const files = await imageService.listDir(WALLPAPER_DIR);
            const newMap = new Map<string, Gdk.Paintable>();

            const loadPromises = files.map(async (file) => {
                const name = file.get_name();
                if (!imageService.isImage(name)) return;

                const fullPath = `${WALLPAPER_DIR}/${name}`;
                try {
                    const texture = await imageService.loadTexture(fullPath, frameRequestWallpapers);
                    newMap.set(fullPath, texture);
                } catch (e) {
                    console.warn(`Failed to load wallpaper: ${name}`, e);
                }
            });

            await Promise.all(loadPromises);

            this._setWallpapers(newMap);
            console.log(`Loaded ${newMap.size} wallpapers.`);

        } catch (error) {
            console.error("Critical error scanning wallpapers:", error);
        }
    }

    public get randomImg(): string | null {
        const keys = Array.from(this._wallpapers.peek().keys());
        if (keys.length === 0) return null;
        return keys[Math.floor(Math.random() * keys.length)];
    }

    public get wallpapers() {
        return this._wallpapers;
    }

    public get timer() {
        return this._timer;
    }
}

export const wallpapersService = new WallpapersClass();
