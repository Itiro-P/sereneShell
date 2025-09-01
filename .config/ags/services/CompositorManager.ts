import { Accessor, createBinding } from "ags";
import { Gdk } from "ags/gtk4";
import { exec } from "ags/process";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
// import AstalNiri from "gi://AstalNiri?version=0.1"

export type CompositorMonitor = AstalHyprland.Monitor;
export type CompositorWorkspace = AstalHyprland.Workspace;

interface ICompositor {
    getWorkspaces: () => Accessor<CompositorWorkspace[]>;
    getFocusedWorkspace: () => Accessor<CompositorWorkspace>;
    areMonitorsEqual: (monitor: Gdk.Monitor, compMonitor: CompositorMonitor) => boolean;
    getCompositorMonitor: (monitor: Gdk.Monitor) => CompositorMonitor;
}

class Hyprland implements ICompositor {
    private default: AstalHyprland.Hyprland;
    private _workspaces: Accessor<AstalHyprland.Workspace[]>;
    private _focusedWorkspace: Accessor<AstalHyprland.Workspace>;

    public constructor() {
        this.default = AstalHyprland.get_default();
        this._workspaces = createBinding(this.default, "workspaces").as((workspaces) => workspaces.sort((a, b) => a.id - b.id));
        this._focusedWorkspace = createBinding(this.default, "focusedWorkspace");
    }

    public getWorkspaces() {
        return this._workspaces;
    }

    public getFocusedWorkspace() {
        return this._focusedWorkspace;
    }

    public areMonitorsEqual(monitor: Gdk.Monitor, compMonitor: CompositorMonitor) {
        const geometry = monitor.get_geometry();
        if(compMonitor.get_model() === monitor.get_model()
        && compMonitor.get_height() === geometry.height
        && compMonitor.get_width() === geometry.width
        && compMonitor.get_x() === geometry.x
        && compMonitor.get_y() === geometry.y) {
            return true;
        }
        return false;
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        const compMonitors = this.default.get_monitors();
        return compMonitors.find(compMonitor => this.areMonitorsEqual(monitor, compMonitor))!;
    }
}

class Niri implements ICompositor {
    private default: AstalHyprland.Hyprland;
    private _workspaces: Accessor<AstalHyprland.Workspace[]>;
    private _focusedWorkspace: Accessor<AstalHyprland.Workspace>;

    public constructor() {
        this.default = AstalHyprland.get_default();
        this._workspaces = createBinding(this.default, "workspaces").as((workspaces) => workspaces.sort((a, b) => a.id - b.id));
        this._focusedWorkspace = createBinding(this.default, "focusedWorkspace");
    }

    public getWorkspaces() {
        return this._workspaces;
    }

    public getFocusedWorkspace() {
        return this._focusedWorkspace;
    }

    public areMonitorsEqual(monitor: Gdk.Monitor, compMonitor: CompositorMonitor) {
        const geometry = monitor.get_geometry();
        if(compMonitor.get_model() === monitor.get_model()
        && compMonitor.get_height() === geometry.height
        && compMonitor.get_width() === geometry.width
        && compMonitor.get_x() === geometry.x
        && compMonitor.get_y() === geometry.y) {
            return true;
        }
        return false;
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        const compMonitors = this.default.get_monitors();
        return compMonitors.find(compMonitor => this.areMonitorsEqual(monitor, compMonitor))!;
    }
}

class CompositorManagerClass {
    private service: ICompositor;

    public constructor() {
        const compositor = exec(["bash", "-c", "echo $XDG_CURRENT_DESKTOP"]);
        switch(compositor) {
            case "Hyprland":
                this.service = new Hyprland;
                break;
            case "Niri":
                this.service = new Niri;
                break;
            default:
                console.error("Compositor não identificado. Fallback para Hyprland");
                this.service = new Hyprland;
                break;
        }
    }

    public get workspaces() {
        return this.service.getWorkspaces();
    }

    public get focusedWorkspace() {
        return this.service.getFocusedWorkspace();
    }

    public areMonitorsEqual(monitor: Gdk.Monitor, compMonitor: CompositorMonitor) {
        return this.service.areMonitorsEqual(monitor, compMonitor);
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        return this.service.getCompositorMonitor(monitor);
    }
}

const compositorManager = new CompositorManagerClass;

export default compositorManager;
