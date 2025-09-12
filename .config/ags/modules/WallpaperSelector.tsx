import { Accessor, createState, onCleanup, Setter } from "ags";
import { createPoll } from "ags/time";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { Swww } from "../services/Swww";
import { Gdk, Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import settingsService from "../services/Settings";

const path = GLib.get_home_dir() + "/.config/ags/wallpapers";
const pollTime = 240000;
const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
];

class WallpaperSelectorClass {
    private images: Accessor<string[]>;
    private setImages: Setter<string[]>;
    private _timerActive: Accessor<boolean>;
    private polling: Accessor<boolean>;

    constructor() {
        [this.images, this.setImages] = createState([] as string[]);
        this._timerActive = settingsService.wallpaperSelectorActive;
        this.polling = createPoll(true, pollTime, (prev: boolean) => !prev);
        this.setImages(this.readImageFiles(path));
    }

    private isImageFile(filename: string) {
        const extension = filename
            .toLowerCase()
            .substring(filename.lastIndexOf("."));
        return imageExtensions.includes(extension) ? extension : null;
    }

    private readImageFiles(directoryPath: string) {
        try {
            const file = Gio.File.new_for_path(directoryPath);

            if (!file.query_exists(null)) return [];

            const enumerator = file.enumerate_children(
                "standard::name,standard::type",
                Gio.FileQueryInfoFlags.NONE,
                null,
            );

            const images: string[] = [];
            let fileInfo;

            while ((fileInfo = enumerator.next_file(null)) !== null) {
                if (fileInfo.get_file_type() === Gio.FileType.REGULAR) {
                    const fileName = fileInfo.get_name();
                    const ext = this.isImageFile(fileName);
                    if (ext) images.push(fileName);
                }
            }

            enumerator.close(null);
            return images;
        } catch (error) {
            console.error(
                "❌ Erro Gio ao ler diretório:",
                directoryPath,
                error,
            );
            return [];
        }
    }

    public get timerActive() {
        return this._timerActive;
    }

    public SelectorIndicator(gdkmonitor: Gdk.Monitor) {
        const unsub = this.polling.subscribe(() => {
            if (this._timerActive.get()) {
                const connector = gdkmonitor.get_connector();
                if (connector) {
                    const imgArray = this.images.get();
                    const img =
                        imgArray[Math.floor(Math.random() * imgArray.length)];
                    Swww.manager.setWallpaper(`${path}/${img}`, {
                        outputs: connector,
                        transitionType: Swww.TransitionType.GROW,
                    });
                } else {
                    execAsync(
                        `notify-send "Monitor ${gdkmonitor.get_description()} não tem conector" "${gdkmonitor.get_description()} não tem conector."`,
                    );
                }
            }
        });
        onCleanup(() => unsub());
        return (
            <box cssClasses={["ToggleActive", "Option"]}>
                <label label={"Wallpaper Selector "} halign={Gtk.Align.START} />
                <Gtk.Switch
                    active={this._timerActive}
                    onStateSet={(src, val) =>
                        (settingsService.setWallpaperSelectorActive = val)
                    }
                />
            </box>
        );
    }
}

const wallpaperSelector = new WallpaperSelectorClass();

export default wallpaperSelector;
