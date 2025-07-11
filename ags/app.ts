import { App, Gdk } from "astal/gtk4"
import style from "./styles/index.scss"
import Bar from "./widget/Bar"

function setupMonitors() {
    const activeMonitors: Set<Gdk.Monitor> = new Set();

    function updateMonitors() {
        const currentMonitors = App.get_monitors();
        const currentMonitorIds = new Set(currentMonitors.map(m => m.get_connector()));

        currentMonitors.forEach(monitor => {
            if (!activeMonitors.has(monitor)) {
                activeMonitors.add(monitor);
                Bar(monitor);
            }
        });

        const removedMonitors: Gdk.Monitor[] = [];
        activeMonitors.forEach(monitor => {
            if (!currentMonitorIds.has(monitor.get_connector())) {
                removedMonitors.push(monitor);
            }
        });

        removedMonitors.forEach(monitor => {
            activeMonitors.delete(monitor);
            console.log(`Monitor removido: ${monitor}`);
        });
    }

    updateMonitors();

    App.notify("monitors");
    App.connect("notify::monitors", () => updateMonitors());
}

App.start({
    css: style,
    main() {
        setupMonitors();
    },
})
