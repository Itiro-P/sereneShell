import { App, Gdk, Gtk } from "astal/gtk4"
import style from "./styles/index.scss"
import Bar from "./widget/Bar"
import CavaBackground from "./widget/Background"
import Background from "./widget/Background"

App.start({
    css: style,
    main() {
        const monitorWidgets: Map<Gdk.Monitor, { bar: Gtk.Widget, background: Gtk.Widget }> = new Map();

        function getMonitorId(monitor: Gdk.Monitor): string {
            const geometry = monitor.get_geometry();
            const scale = monitor.get_scale_factor();
            const manufacturer = monitor.get_manufacturer() || "unknown";
            const model = monitor.get_model() || "unknown";

            return `${manufacturer}_${model}_${geometry.width}x${geometry.height}@${geometry.x},${geometry.y}_${scale}`;
        }

        function updateMonitors() {
            const currentMonitors = App.get_monitors();
            const currentMonitorIds = new Set(currentMonitors.map(getMonitorId));

            currentMonitors.forEach(monitor => {
                if (!monitorWidgets.has(monitor)) {
                    const bar = Bar(monitor);
                    const background = Background(monitor);
                    monitorWidgets.set(monitor, { bar, background });
                }
            });

            const removedMonitors: Gdk.Monitor[] = [];
            monitorWidgets.forEach((widgets, monitor) => {
                if (!currentMonitorIds.has(getMonitorId(monitor))) {
                    removedMonitors.push(monitor);
                }
            });

            removedMonitors.forEach(monitor => {
                const widgets = monitorWidgets.get(monitor);

                if (widgets) {
                    try {
                        widgets.bar.unparent();
                    } catch (error) {
                        console.warn("Error destroying bar widget:", error);
                    }

                    try {
                        widgets.background.unparent();
                    } catch (error) {
                        console.warn("Error destroying background widget:", error);
                    }

                    monitorWidgets.delete(monitor);
                }
            });
        }

        updateMonitors();
        App.notify("monitors");

        App.connect("notify::monitors", () => {
            updateMonitors();
        });
    },
})
