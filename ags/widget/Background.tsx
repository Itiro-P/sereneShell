import { Astal, Gdk, Gtk } from "ags/gtk4"
import DateTime from "../modules/DateTime";
import app from "ags/gtk4/app";
import Cava from "../modules/Cava";
import Hyprland from "../services/Hyprland";

export default function Background({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

    return (
        <window
            namespace='AstalBackground'
            cssClasses={["Background"]}
            layer={Astal.Layer.BOTTOM}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT | LEFT | BOTTOM}
            application={app}
            visible={Hyprland.instance.hasAnyClient}
        >
            <overlay
                $={
                    (self) => {
                        self.set_child(
                            <box halign={Gtk.Align.FILL} valign={Gtk.Align.END} heightRequest={Math.floor(gdkmonitor.get_geometry().height * .25)}>
                                {Cava.instance.Cava(["CavaOverlay"])}
                            </box> as Gtk.Widget
                        );
                        self.add_overlay(
                            <box halign={Gtk.Align.END} valign={Gtk.Align.START} children={DateTime.instance.DateTimeCalendar} /> as Gtk.Widget
                        );
                    }
                }
            />
        </window>
    );
}
