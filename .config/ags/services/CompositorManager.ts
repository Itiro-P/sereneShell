import { Accessor, createBinding } from "ags";
import { Gdk } from "ags/gtk4";
import { exec } from "ags/process";
import AstalHyprland from "gi://AstalHyprland";
import settingsService from "./Settings";

export type CompositorMonitor = AstalHyprland.Monitor;
export type CompositorWorkspace = AstalHyprland.Workspace;
export type CompositorClient = AstalHyprland.Client;

interface ICompositor {
    getWorkspaces: () => Accessor<CompositorWorkspace[]>;
    getFocusedWorkspace: () => Accessor<CompositorWorkspace>;
    getClients: () => Accessor<CompositorClient[]>;
    getFocusedClient: () => Accessor<CompositorClient>;
    areMonitorsEqual: (monitor: Gdk.Monitor, compMonitor: CompositorMonitor) => boolean;
    getCompositorMonitor: (monitor: Gdk.Monitor) => CompositorMonitor;
    getAnimationState: () => boolean;
    toggleAnimations: (val?: boolean) => void;
}

class Hyprland implements ICompositor {
    private default: AstalHyprland.Hyprland;
    private _workspaces: Accessor<AstalHyprland.Workspace[]>;
    private _focusedWorkspace: Accessor<AstalHyprland.Workspace>;
    private _clients: Accessor<AstalHyprland.Client[]>;
    private _focusedClient: Accessor<AstalHyprland.Client>;

    public constructor() {
        this.default = AstalHyprland.get_default();
        this._workspaces = createBinding(this.default, "workspaces").as((workspaces) => workspaces.sort((a, b) => a.id - b.id));
        this._focusedWorkspace = createBinding(this.default, "focusedWorkspace");
        this._clients = createBinding(this.default, "clients");
        this._focusedClient = createBinding(this.default, "focusedClient");

        // Aplicar configurações de animação.
        this.toggleAnimations(settingsService.animationsEnabled.get());
    }

    public getWorkspaces() {
        return this._workspaces;
    }

    public getFocusedWorkspace() {
        return this._focusedWorkspace;
    }

    public getClients() {
        return this._clients;
    }

    public getFocusedClient() {
        return this._focusedClient;
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

class CompositorManagerClass {
    private compositor: ICompositor;

    public constructor() {
        const compositor = exec(["bash", "-c", "echo $XDG_CURRENT_DESKTOP"]);
        switch(compositor) {
            case "hyprland":
            case "Hyprland":
                console.log("usando Hyprland");
                this.compositor = new Hyprland;
                break;
            default:
                throw new Error("Compositor não suportado.");
        }
    }

    public get workspaces() {
        return this.compositor.getWorkspaces();
    }

    public get focusedWorkspace() {
        return this.compositor.getFocusedWorkspace();
    }

    public get clients() {
        return this.compositor.getClients();
    }

    public get focusedClient() {
        return this.compositor.getFocusedClient();
    }

    public areMonitorsEqual(monitor: Gdk.Monitor, compMonitor: CompositorMonitor) {
        return this.compositor.areMonitorsEqual(monitor, compMonitor);
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        return this.compositor.getCompositorMonitor(monitor);
    }

    public get animationState() {
        return this.compositor.getAnimationState();
    }

    public toggleAnimations(val?: boolean) {
        this.compositor.toggleAnimations(val);
    }
}

const compositorManager = new CompositorManagerClass;

export default compositorManager;
