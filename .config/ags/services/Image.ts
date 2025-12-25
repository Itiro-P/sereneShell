import { Gdk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import Gly from "gi://Gly?version=2";
import GlyGtk4 from "gi://GlyGtk4?version=2";

const PREVIEW_SIZE_COVER_ART = { width: 92, height: 92 };
const frameRequestCoverArt = new Gly.FrameRequest;
frameRequestCoverArt.set_scale(PREVIEW_SIZE_COVER_ART.width, PREVIEW_SIZE_COVER_ART.height);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

class ImageClass {

    public constructor() {

    }

    public isImage(filename: string): boolean {
        const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
        return IMAGE_EXTENSIONS.has(ext);
    }

    public async listDir(path: string): Promise<Gio.FileInfo[]> {
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

    public async loadTexture(fullPath: string, req: Gly.FrameRequest): Promise<Gdk.Texture> {
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
}

export const imageService = new ImageClass;
