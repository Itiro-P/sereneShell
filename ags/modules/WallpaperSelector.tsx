import { Gdk, Gtk } from "ags/gtk4";
import Adw from "gi://Adw?version=1";
import { WallpaperManager } from "../services/Wallpaper";
import { For, onCleanup } from "ags";
import { Swww } from "../utils/Swww";

export default class WallpaperSelector {
    private static _instance: WallpaperSelector;
    private previewWidth: number = 384;
    private previewHeight: number = 216;
    private numberChilren: number = 4;

    private constructor() {

    }

    public static get instance() {
        if(!this._instance) {
            this._instance = new WallpaperSelector;
        }
        return this._instance;
    }

    private Wallpaper({ path, texture }: { path: string, texture: Gdk.Texture }) {
        const click = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
        const handler = click.connect('pressed', () => { Swww.Manager.instance.setWallpaper(path, { transitionType: Swww.TransitionType.GROW, transitionDurantion: 2 }) });
        onCleanup(() => click.disconnect(handler));

        return (
            <Adw.Clamp
                cssClasses={["Wallpaper"]}
                maximumSize={this.previewHeight}
                heightRequest={this.previewHeight}
                overflow={Gtk.Overflow.HIDDEN}
                $={self => self.add_controller(click)}
            >
                <Adw.Clamp maximumSize={this.previewWidth} widthRequest={this.previewWidth}>
                    <Gtk.Picture contentFit={Gtk.ContentFit.COVER} paintable={texture} />
                </Adw.Clamp>
            </Adw.Clamp>
        );
    }

    public get WallpaperSelector() {
        return (
            <box cssClasses={["WallpaperSystem"]} orientation={Gtk.Orientation.VERTICAL}>
                <label cssClasses={["Subtitle"]} label={'Papéis de parede'} />

                <Gtk.ScrolledWindow cssClasses={["Wallpapers"]} propagate_natural_width heightRequest={this.previewHeight * 2}>
                    <Gtk.FlowBox rowSpacing={4} columnSpacing={4} homogeneous maxChildrenPerLine={this.numberChilren}>
                        <For each={WallpaperManager.instance.texturesMap} children={([s, t]) => this.Wallpaper({ path: s, texture: t })} />
                    </Gtk.FlowBox>
                </Gtk.ScrolledWindow>
            </box>
        );
    }
}
