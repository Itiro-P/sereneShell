import { Astal, Gdk, Gtk } from "ags/gtk4"
import { DateTimeCalendar } from "../modules/DateTime";
import app from "ags/gtk4/app";
import { CavaOverlay } from "../modules/Cava";
import { hasAnyClient } from "../services/Hyprland";

export default function Background({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

    return (
        <window
            namespace='AstalBackground'
            cssClasses={["Background"]}
            layer={Astal.Layer.BACKGROUND}
            gdkmonitor={gdkmonitor}
            anchor={TOP | RIGHT | LEFT | BOTTOM}
            application={app}
            visible={hasAnyClient}
        >
            <overlay
                $={
                    (self) => {
                        self.set_child(
                            <box halign={Gtk.Align.FILL} valign={Gtk.Align.END} heightRequest={Math.floor(gdkmonitor.get_geometry().height * .25)}>
                                <CavaOverlay />
                            </box> as Gtk.Widget
                        );
                        self.add_overlay(
                            <box halign={Gtk.Align.END} valign={Gtk.Align.START}>
                                <DateTimeCalendar />
                            </box> as Gtk.Widget
                        );
                    }
                }
            />
        </window>
    );
}
