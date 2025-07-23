import { Accessor, createState, Setter } from "ags";
import { Gdk } from "ags/gtk4";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import Gly from "gi://Gly?version=1";
import GlyGtk4 from "gi://GlyGtk4?version=1";

const wallpaperDir = `${GLib.get_home_dir()}/.config/ags/wallpapers`;

export class WallpaperManager {
    private static _instance: WallpaperManager | null = null;
    private _texturesState: Accessor<Gdk.Texture[]>;
    private _setTextures: Setter<Gdk.Texture[]>;


    private constructor() {
        [this._texturesState, this._setTextures] = createState<Gdk.Texture[]>([]);
        this.loadWallpapers();
    }

    private loadWallpapers(): void {
        try {
            const dir = Gio.File.new_for_path(wallpaperDir);
            if (!dir.query_exists(null)) {
                console.warn('Diretório wallpapers não existe:', wallpaperDir);
                return;
            }

            const enumerator = dir.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
            let fileInfo;

            while ((fileInfo = enumerator.next_file(null))) {
                const fileName = fileInfo.get_name();
                const fileType = fileInfo.get_file_type();

                if (fileType === Gio.FileType.REGULAR) {
                    const extension = fileName.toLowerCase().split('.').pop();
                    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

                    if (extension && imageExtensions.includes(extension)) {
                        this.loadImage(`${wallpaperDir}/${fileName}`).then(t => { if (t) this._setTextures((prev) => [...prev, t]); });
                    } else continue;
                }
            }

            enumerator.close(null);

        } catch (error) {
            console.error('Erro ao listar wallpapers:', error);
            return;
        }
    }

    public static get instance(): WallpaperManager {
        if (!WallpaperManager._instance) {
            WallpaperManager._instance = new WallpaperManager();
        }
        return WallpaperManager._instance;
    }

    public get textures() {
        return this._texturesState;
    }

    private async loadImage(imagePath: string): Promise<Gdk.Texture | null> {
        try {
            const file = Gio.File.new_for_path(imagePath);
            const loader = Gly.Loader.new(file);

            const image = await new Promise<Gly.Image | null>((resolve) => {
                loader.load_async(null, (_, result) => {
                    try {
                        const img = loader.load_finish(result);
                        resolve(img);
                    } catch (error) {
                        console.error('Erro ao carregar imagem async:', error);
                        resolve(null);
                    }
                });
            });

            if (!image) return null;

            const frame = await new Promise<Gly.Frame | null>((resolve) => {
                image.next_frame_async(null, (_, result) => {
                    try {
                        const frm = image.next_frame_finish(result);
                        resolve(frm);
                    } catch (error) {
                        console.error('Erro ao carregar frame async:', error);
                        resolve(null);
                    }
                });
            });

            if (!frame) return null;
            return GlyGtk4.frame_get_texture(frame);
        } catch (error) {
            console.error('Erro ao carregar imagem:', error);
            return null;
        }
    }
}
