import { Accessor, createBinding } from "ags";
import { Gdk } from "ags/gtk4";
import { exec } from "ags/process";
import AstalHyprland from "gi://AstalHyprland";
import AstalNiri from "gi://AstalNiri";
import settingsService from "./Settings";

export type CompositorMonitor = AstalHyprland.Monitor | AstalNiri.Output;
export type CompositorWorkspace = AstalHyprland.Workspace | AstalNiri.Workspace;

interface ICompositor {
    getWorkspaces: () => Accessor<CompositorWorkspace[]>;
    getFocusedWorkspace: () => Accessor<CompositorWorkspace>;
    areMonitorsEqual: (monitor: Gdk.Monitor, compMonitor: CompositorMonitor) => boolean;
    getCompositorMonitor: (monitor: Gdk.Monitor) => CompositorMonitor;
    getAnimationState: () => boolean;
    toggleAnimations: (val?: boolean) => void;
}

class Hyprland implements ICompositor {
    private default: AstalHyprland.Hyprland;
    private _workspaces: Accessor<AstalHyprland.Workspace[]>;
    private _focusedWorkspace: Accessor<AstalHyprland.Workspace>;

    public constructor() {
        this.default = AstalHyprland.get_default();
        this._workspaces = createBinding(this.default, "workspaces").as((workspaces) => workspaces.sort((a, b) => a.id - b.id));
        this._focusedWorkspace = createBinding(this.default, "focusedWorkspace");

        // Aplicar configurações de animação.
        this.toggleAnimations(settingsService.animationsEnabled.get());
    }

    public getWorkspaces() {
        return this._workspaces;
    }

    public getFocusedWorkspace() {
        return this._focusedWorkspace;
    }

    public areMonitorsEqual(monitor: Gdk.Monitor, compMonitor: CompositorMonitor) {
        const geometry = monitor.get_geometry();
        const hyprMonitor = compMonitor as AstalHyprland.Monitor;
        if(hyprMonitor.get_model() === monitor.get_model()
        && hyprMonitor.get_x() === geometry.x
        && hyprMonitor.get_y() === geometry.y) {
            return true;
        }
        return false;
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        const compMonitors = this.default.get_monitors();
        return compMonitors.find(compMonitor => this.areMonitorsEqual(monitor, compMonitor))!;
    }

    public getAnimationState() {
        try {
            return JSON.parse(exec("hyprctl getoption animations:enabled -j")) === 1;
        } catch (error) {
            console.warn("Erro ao verificar estado das animações:", error);
            return false;
        }
    }

    public toggleAnimations(val?: boolean) {
        const newState = val ?? !this.getAnimationState();
        try {
            exec(`hyprctl keyword animations:enabled ${newState ? 1 : 0}`);
            exec(`hyprctl keyword decoration:shadow:enabled ${newState ? 1 : 0}`);
        } catch (error) {
            console.error("Erro ao alterar animações:", error);
        }
    }
}

class Niri implements ICompositor {
    private default: AstalNiri.Niri;
    private _workspaces: Accessor<AstalNiri.Workspace[]>;
    private _focusedWorkspace: Accessor<AstalNiri.Workspace>;

    public constructor() {
        this.default = AstalNiri.get_default();
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
        const niriOutput = compMonitor as AstalNiri.Output;
        const phySize = niriOutput.get_physical_size();
        if(niriOutput.get_model() === monitor.get_model()
        && phySize?.x === geometry.x && phySize.y === geometry.y) {
            return true;
        }
        return false;
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        const compMonitors = this.default.get_outputs();
        return compMonitors.find(compMonitor => this.areMonitorsEqual(monitor, compMonitor))!;
    }

    public getAnimationState() {
        try {
            return JSON.parse(exec("niri-msg get-option animations-enabled -j")) === 1;
        } catch (error) {
            console.warn("Erro ao verificar estado das animações:", error);
            return false;
        }
    }

    public toggleAnimations(val?: boolean) {
        const newState = val ?? !this.getAnimationState();
        try {
            exec('niri-msg set-option animations-enabled ' + newState);
        } catch (error) {
            console.error("Erro ao alterar animações:", error);
        }
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

    public get animationState() {
        return this.service.getAnimationState();
    }

    public toggleAnimations(val?: boolean) {
        this.service.toggleAnimations(val);
    }
}

const compositorManager = new CompositorManagerClass;

export default compositorManager;
