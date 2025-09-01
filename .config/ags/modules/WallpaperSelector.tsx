import { Accessor, createState, onCleanup, Setter } from "ags";
import { createPoll } from "ags/time";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { Swww } from "../utils/Swww";
import { Gdk, Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import settingsService from "../services/Settings";

const path = GLib.get_home_dir() + '/.config/ags/wallpapers';
const pollTime = 240000;
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

class WallpaperSelectorClass {
    private images: Accessor<string[]>;
    private setImages: Setter<string[]>;
    private _timerActive: Accessor<boolean>;
    private _setTimerActive: Setter<boolean>;
    private polling: Accessor<boolean>;
    private static widgetCount: number = 0;
    private unsub: () => void;

    constructor() {
        [this.images, this.setImages] = createState([] as string[]);
        [this._timerActive, this._setTimerActive] = createState(settingsService.wallpaperSelectorActive.get());
        this.polling = createPoll(true, pollTime, (prev: boolean) => !prev);

        this.unsub = settingsService.wallpaperSelectorActive.subscribe(() => this._setTimerActive(settingsService.wallpaperSelectorActive.get()));
        this.setImages(this.readImageFiles(path));
    }

    private isImageFile(filename: string) {
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return imageExtensions.includes(extension) ? extension: null;
    }

    private readImageFiles(directoryPath: string) {
        try {
            const file = Gio.File.new_for_path(directoryPath);

            if (!file.query_exists(null)) return [];

            const enumerator = file.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);

            const images: string[] = [];
            let fileInfo;

            while ((fileInfo = enumerator.next_file(null)) !== null) {
                if (fileInfo.get_file_type() === Gio.FileType.REGULAR) {
                    const fileName = fileInfo.get_name();
                    const ext = this.isImageFile(fileName);
                    if(ext) images.push(fileName);
                }
            }

            enumerator.close(null);
            return images;
        } catch (error) {
            console.error('❌ Erro Gio ao ler diretório:', directoryPath, error);
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
                if(connector) {
                    const imgArray = this.images.get();
                    const img = imgArray[Math.floor(Math.random() * imgArray.length)];
                    Swww.manager.setWallpaper(`${path}/${img}`, { outputs: connector, transitionType: Swww.TransitionType.GROW });
                } else {
                    execAsync(`notify-send "Monitor ${gdkmonitor.get_description()} não tem conector" "${gdkmonitor.get_description()} não tem conector."`);
                }
            }
        });
        return (
            <box
                cssClasses={['SelectorIndicator']}
                orientation={Gtk.Orientation.VERTICAL}
                $={() => WallpaperSelectorClass.widgetCount += 1}
                onDestroy={
                    () => {
                        WallpaperSelectorClass.widgetCount -= 1
                        if (WallpaperSelectorClass.widgetCount <= 0) this.unsub();
                        unsub();
                    }
                }
            >
                <label
                    cssClasses={["Subtitle"]}
                    label={'Seletor de Papéis de Parede'}
                />
                <button
                    cssClasses={["Option", "ToggleActive"]}
                    label={this._timerActive.as(ta => `Estado: ${ta ? 'Ativo': 'Desativado'}`)}
                    onClicked={() => this._setTimerActive(!this._timerActive.get())}
                />
            </box>
        );
    }
}

const wallpaperSelector = new WallpaperSelectorClass;

export default wallpaperSelector;
