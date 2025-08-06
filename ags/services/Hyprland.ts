import { Accessor, createBinding, createComputed } from "ags";
import { Gdk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export default class Hyprland {
    private static _instance: Hyprland;
    private default: AstalHyprland.Hyprland;
    private _workspaces: Accessor<AstalHyprland.Workspace[]>;
    private _focusedWorkspace: Accessor<AstalHyprland.Workspace>;
    private _clients: Accessor<AstalHyprland.Client[]>;
    private _monitors: Accessor<AstalHyprland.Monitor[]>;
    private _focusedClient: Accessor<AstalHyprland.Client>;

    private constructor() {
        this.default = AstalHyprland.get_default();
        this._workspaces = createBinding(this.default, "workspaces").as((workspaces) => workspaces.sort((a, b) => a.id - b.id));
        this._focusedWorkspace = createBinding(this.default, "focusedWorkspace");
        this._clients = createBinding(this.default, "clients");
        this._focusedClient = createBinding(this.default, "focusedClient");
        this._monitors = createBinding(this.default, "monitors");
    }

    public static get instance() {
        if(!this._instance) {
            this._instance = new Hyprland;
        }
        return this._instance;
    }

    public get workspaces() {
        return this._workspaces;
    }

    public get focusedWorkspace() {
        return this._focusedWorkspace;
    }

    public get clients() {
        return this._clients;
    }

    public get focusedClient() {
        return this._focusedClient;
    }

    public getHyprlandMonitor(monitor: Gdk.Monitor) {
        const hyprlandMonitors = this._monitors.get();
        for(const hyprMonitor of hyprlandMonitors) {
            if(hyprMonitor.get_model() === monitor.get_model()) {
                return hyprMonitor;
            }
        }
        console.warn('Usando fallback');
        return hyprlandMonitors[0];
    }
}
