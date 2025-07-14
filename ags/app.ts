import { App, Gdk, Gtk } from "astal/gtk4"
import style from "./styles/index.scss"
import Bar from "./widget/Bar"

App.start({
    css: style,
    main() {
        const monitorBars: Map<Gdk.Monitor, Gtk.Widget> = new Map();

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
                if (!monitorBars.has(monitor)) {
                    const bar = Bar(monitor);
                    monitorBars.set(monitor, bar);
                }
            });

            const removedMonitors: Gdk.Monitor[] = [];
            monitorBars.forEach((bar, monitor) => {
                if (!currentMonitorIds.has(getMonitorId(monitor))) {
                    removedMonitors.push(monitor);
                }
            });

            removedMonitors.forEach(monitor => {
                const bar = monitorBars.get(monitor);

                if (bar) {
                    bar.unparent();
                    monitorBars.delete(monitor);
                }
            });
        }

        updateMonitors();
        App.notify("monitors");
        App.connect("notify::monitors", () => updateMonitors());
    },
})
