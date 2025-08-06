import { Accessor, createState, Setter } from "ags";
import { Gdk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import Gly from "gi://Gly?version=1";
import GlyGtk4 from "gi://GlyGtk4?version=1";

const wallpaperDir = `${GLib.get_home_dir()}/.config/hypr/configs/wallpapers`;
const MAX_CONCURRENT_LOADS = 4;

export class WallpaperManager {
    private static _instance: WallpaperManager | null = null;
    private _texturesMap: Accessor<Map<string, Gdk.Texture>>;
    private _setTexturesMap: Setter<Map<string, Gdk.Texture>>;
    private _cancellable = new Gio.Cancellable();

    private constructor() {
        const [texturesMap, setTexturesMap] = createState<Map<string, Gdk.Texture>>(new Map());
        this._texturesMap = texturesMap;
        this._setTexturesMap = setTexturesMap;
        this.loadWallpapers();
    }

    public destroy() {
        this._cancellable.cancel();
        WallpaperManager._instance = null;
    }

    private async loadWallpapers(): Promise<void> {
        try {
            const dir = Gio.File.new_for_path(wallpaperDir);
            if (!dir.query_exists(null)) {
                console.warn('Diretório wallpapers não existe:', wallpaperDir);
                return;
            }

            const enumerator = dir.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);

            const imageFiles: string[] = [];
            let fileInfo;

            while ((fileInfo = enumerator.next_file(null))) {
                if (this._cancellable.is_cancelled()) return;

                const fileName = fileInfo.get_name();
                const fileType = fileInfo.get_file_type();

                if (fileType === Gio.FileType.REGULAR) {
                    const extension = fileName.toLowerCase().split('.').pop();
                    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

                    if (extension && imageExtensions.includes(extension)) {
                        imageFiles.push(`${wallpaperDir}/${fileName}`);
                    }
                }
            }
            enumerator.close(null);

            await this.loadImagesConcurrently(imageFiles);
        } catch (error) {
            if (!this._cancellable.is_cancelled()) {
                console.error('Erro ao listar wallpapers:', error);
            }
        }
    }

    private async loadImagesConcurrently(imageFiles: string[]): Promise<void> {
        let index = 0;

        const worker = async () => {
            while (index < imageFiles.length && !this._cancellable.is_cancelled()) {
                const file = imageFiles[index++];
                try {
                    if(this._texturesMap.as(m => !m.has(file))) {
                        const texture = await this.loadImage(file);
                        if (texture) {
                            this._setTexturesMap(prev => {
                                const newMap = new Map(prev);
                                newMap.set(file, texture);
                                return newMap;
                            });
                        }
                    }
                } catch (error) {
                    if (!this._cancellable.is_cancelled()) {
                        console.error(`Erro ao carregar ${file}:`, error);
                    }
                }
            }
        };

        const workers = Array(Math.min(MAX_CONCURRENT_LOADS, imageFiles.length)).fill(null).map(() => worker());

        await Promise.all(workers);
    }

    public static get instance(): WallpaperManager {
        if (!WallpaperManager._instance) {
            WallpaperManager._instance = new WallpaperManager();
        }
        return WallpaperManager._instance;
    }

    public get texturesMap() {
        return this._texturesMap;
    }

    public get texturesList(): Gdk.Texture[] {
        return Array.from(this._texturesMap.get().values());
    }

    private async loadImage(imagePath: string): Promise<Gdk.Texture | null> {
        if (this._cancellable.is_cancelled()) return null;

        try {
            const file = Gio.File.new_for_path(imagePath);
            const loader = Gly.Loader.new(file);

            const image = await new Promise<Gly.Image | null>((resolve) => {
                if (this._cancellable.is_cancelled()) return resolve(null);
                loader.load_async(this._cancellable, (_, result) => {
                    if (this._cancellable.is_cancelled()) return resolve(null);
                    try {
                        resolve(loader.load_finish(result));
                    } catch (error) {
                        console.error('Erro ao carregar imagem:', error);
                        resolve(null);
                    }
                });
            });

            if (!image) return null;

            const frame = await new Promise<Gly.Frame | null>((resolve) => {
                if (this._cancellable.is_cancelled()) return resolve(null);
                image.next_frame_async(this._cancellable, (_, result) => {
                    if (this._cancellable.is_cancelled()) return resolve(null);
                    try {
                        resolve(image.next_frame_finish(result));
                    } catch (error) {
                        console.error('Erro ao carregar frame:', error);
                        resolve(null);
                    }
                });
            });

            return frame ? GlyGtk4.frame_get_texture(frame) : null;
        } catch (error) {
            if (!this._cancellable.is_cancelled()) {
                console.error('Erro ao carregar imagem:', error);
            }
            return null;
        }
    }
}
