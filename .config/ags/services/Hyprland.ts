import { Accessor, createBinding, createComputed } from "ags";
import { Gdk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export class Hyprland {
    private default: AstalHyprland.Hyprland;
    private _workspaces: Accessor<AstalHyprland.Workspace[]>;
    private _focusedWorkspace: Accessor<AstalHyprland.Workspace>;

    public constructor() {
        this.default = AstalHyprland.get_default();
        this._workspaces = createBinding(this.default, "workspaces").as((workspaces) => workspaces.sort((a, b) => a.id - b.id));
        this._focusedWorkspace = createBinding(this.default, "focusedWorkspace");
    }

    public get workspaces() {
        return this._workspaces;
    }

    public get focusedWorkspace() {
        return this._focusedWorkspace;
    }

    public areMonitorsEqual(monitor: Gdk.Monitor, hyprMonitor: AstalHyprland.Monitor) {
        const geometry = monitor.get_geometry();
        if(hyprMonitor.get_model() === monitor.get_model()
        && hyprMonitor.get_height() === geometry.height
        && hyprMonitor.get_width() === geometry.width
        && hyprMonitor.get_x() === geometry.x
        && hyprMonitor.get_y() === geometry.y) {
            return true;
        }
        return false;
    }

    public getHyprlandMonitor(monitor: Gdk.Monitor) {
        const hyprlandMonitors = this.default.get_monitors();
        return hyprlandMonitors.find(hyprMonitor => this.areMonitorsEqual(monitor, hyprMonitor)) || hyprlandMonitors[0];
    }
}

const hyprlandService = new Hyprland;

export default hyprlandService;
