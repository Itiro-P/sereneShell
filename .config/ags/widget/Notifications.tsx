import { Astal, Gtk, Gdk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import app from "ags/gtk4/app";
import { Accessor, createBinding, For, onCleanup } from "ags";
import { formatTime } from "../services/TimeFormatter";
import Pango from "gi://Pango?version=1.0";

class NotificationsClass {
    private default: AstalNotifd.Notifd;
    private notifications: Accessor<AstalNotifd.Notification[]>;

    public constructor() {
        this.default = AstalNotifd.get_default();
        this.notifications = createBinding(this.default, "notifications");
    }

    private notification({ n }: { n: AstalNotifd.Notification }) {
        const appIcon = createBinding(n, "appIcon");
        return (
            <box cssClasses={["Notification"]} orientation={Gtk.Orientation.VERTICAL}>
                <box>
                    <label label={n.get_app_name()} />
                    <label label={formatTime(n.get_time())} />
                </box>
                <box>
                    <image visible={appIcon(ai => ai !== undefined && ai !== null)} iconName={appIcon} />
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        <label useMarkup wrapMode={Pango.WrapMode.CHAR} justify={Gtk.Justification.FILL} label={n.get_body() ?? n.get_summary()} />
                    </box>
                </box>
            </box>
        );
    }

    public notificationsOverlay(gdkmonitor: Gdk.Monitor) {
        const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

        return (
            <window
                name={'NotificationsOverlay ' + gdkmonitor.get_connector()}
                namespace='NotificationsOverlay'
                visible
                layer={Astal.Layer.OVERLAY}
                gdkmonitor={gdkmonitor}
                anchor={TOP | LEFT}
                application={app}
                $={self => onCleanup(() => self.destroy())}
            >
                <box cssClasses={["NotificationsOverlay"]} orientation={Gtk.Orientation.VERTICAL}>
                    <For each={this.notifications} children={n => <this.notification n={n} />} />
                </box>
            </window>
        );
    }
}

const notifications = new NotificationsClass;

export default notifications;
