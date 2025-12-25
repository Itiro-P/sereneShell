import { Gdk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import Gly from "gi://Gly?version=2";
import GlyGtk4 from "gi://GlyGtk4?version=2";

export namespace Image {
    export async function loadImage(
        path: string,
        frameRequest?: Gly.FrameRequest
    ): Promise<Gdk.Texture | null> {
        const file = Gio.file_new_for_path(path);
        const loader = Gly.Loader.new(file);

        try {
            const image = await new Promise<Gly.Image>((resolve, reject) => {
                loader.load_async(null, (obj, res) => {
                    try { resolve(obj!.load_finish(res)); } catch (e) { reject(e); }
                });
            });

            const frame = await new Promise<Gly.Frame>((resolve, reject) => {
                const cb = (obj: any, res: Gio.AsyncResult) => {
                    try {
                        resolve(frameRequest ? obj.get_specific_frame_finish(res) : obj.next_frame_finish(res));
                    } catch (e) { reject(e); }
                };

                if (frameRequest) image.get_specific_frame_async(frameRequest, null, cb);
                else image.next_frame_async(null, cb);
            });

            return GlyGtk4.frame_get_texture(frame);
        } catch (error) {
            console.error(`Failed to load image ${path}:`, error);
            return null;
        }
    }
}
