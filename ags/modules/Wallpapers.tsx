import { Gdk, Gtk } from "ags/gtk4";
import Adw from "gi://Adw?version=1";
import { WallpaperManager } from "../services/Wallpaper";
import { For } from "ags";

const previewWidth = 384;
const previewHeight = 216;
const numberChilren = 4;



function Wallpaper({ texture }: { texture: Gdk.Texture }) {
    return (
        <Adw.Clamp cssClasses={["Wallpaper"]} maximumSize={previewHeight} heightRequest={previewHeight} overflow={Gtk.Overflow.HIDDEN}>
            <Adw.Clamp maximumSize={previewWidth} widthRequest={previewWidth} overflow={Gtk.Overflow.HIDDEN}>
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
                    <For each={WallpaperManager.instance.textures} children={t => <Wallpaper texture={t} />} />
                </Gtk.FlowBox>
            </Gtk.ScrolledWindow>
        </box>
    );
}
