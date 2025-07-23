import { Gdk, Gtk } from "ags/gtk4";
import Adw from "gi://Adw?version=1";
import { WallpaperManager } from "../services/Wallpaper";
import { For, onCleanup } from "ags";
import { Swww } from "../utils/Swww";

const previewWidth = 384;
const previewHeight = 216;
const numberChilren = 4;

function Wallpaper({ path, texture }: { path: string, texture: Gdk.Texture }) {
    const filePath = path;
    const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
    const handler = click.connect('pressed', () => { Swww.Manager.instance.setWallpaper(filePath, { transitionType: Swww.TransitionType.RANDOM, transitionDurantion: 2 }) });
    onCleanup(() => click.disconnect(handler));

    return (
        <Adw.Clamp
            cssClasses={["Wallpaper"]}
            maximumSize={previewHeight}
            heightRequest={previewHeight}
            overflow={Gtk.Overflow.HIDDEN}
            $={self => self.add_controller(click)}
        >
            <Adw.Clamp maximumSize={previewWidth} widthRequest={previewWidth}>
                <Gtk.Picture contentFit={Gtk.ContentFit.COVER} paintable={texture} />
            </Adw.Clamp>
        </Adw.Clamp>
    );
}

export default function WallpaperSystem() {
    return (
        <box cssClasses={["WallpaperSystem"]} orientation={Gtk.Orientation.VERTICAL}>
            <label cssClasses={["Subtitle"]} label={'Papéis de parede'} />

            <Gtk.ScrolledWindow cssClasses={["Wallpapers"]} propagate_natural_width heightRequest={previewHeight * 2}>
                <Gtk.FlowBox rowSpacing={4} columnSpacing={4} homogeneous maxChildrenPerLine={numberChilren}>
                    <For each={WallpaperManager.instance.texturesMap} children={([s, t]) => <Wallpaper path={s} texture={t} />} />
                </Gtk.FlowBox>
            </Gtk.ScrolledWindow>
        </box>
    );
}
