import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { IClient, ICompositor, IMonitor, IWorkspace } from "../../types";
import { Accessor, createBinding } from "ags";
import { exec } from "ags/process";
import settingsService from "../Settings";
import { Gdk } from "ags/gtk4";

export class HyprClient implements IClient {
    private _client: AstalHyprland.Client;
    public title: Accessor<string>;
    public initialTitle: Accessor<string>;
    public class: Accessor<string>;
    public initialClass: Accessor<string>;

    constructor(client: AstalHyprland.Client) {
        this._client = client;
        this.title = createBinding(client, "title");
        this.initialTitle = createBinding(client, "initialTitle");
        this.class = createBinding(client, "class");
        this.initialClass = createBinding(client, "initialClass");
    }

    public focus() {
        this._client.focus();
    }
}

export class HyprWorkspace implements IWorkspace {
    private _workspace: AstalHyprland.Workspace;
    public id: Accessor<number>;
    public clients: Accessor<IClient[]>;
    constructor(workspace: AstalHyprland.Workspace) {
        this._workspace = workspace;
        this.id = createBinding(workspace, "id");
        this.clients = createBinding(workspace, "clients")(cs => cs.map(c => new HyprClient(c)));
    }

    public focus() {
        this._workspace.focus();
    }
}

export class HyprMonitor implements IMonitor {
    public static _workspaces: Accessor<AstalHyprland.Workspace[]>;
    private _monitor: AstalHyprland.Monitor;
    public geometry: { x: number; y: number; width: number; height: number; };
    public model: string;
    public workspaces: Accessor<IWorkspace[]>;
    public focusedWorkspace: Accessor<IWorkspace>;

    constructor(monitor: AstalHyprland.Monitor) {
        this._monitor = monitor;
        this.model = monitor.get_model();
        HyprMonitor._workspaces = createBinding(AstalHyprland.get_default(), "workspaces");
        this.geometry = { x: monitor.get_x(), y: monitor.get_y(), width: monitor.get_width(), height: monitor.get_height() };
        this.workspaces = HyprMonitor._workspaces(ws => ws.filter(w => w.get_monitor() == monitor).map(w => new HyprWorkspace(w)));
        this.focusedWorkspace = createBinding(monitor, "activeWorkspace")(aw => new HyprWorkspace(aw));
    }

    public focus() {
        this._monitor.focus();
    }
}

export class Hyprland implements ICompositor {
    private default: AstalHyprland.Hyprland;
    private _workspaces: Accessor<IWorkspace[]>;
    private _focusedWorkspace: Accessor<IWorkspace>;
    private _clients: Accessor<IClient[]>;
    private _focusedClient: Accessor<IClient>;

    public constructor() {
        this.default = AstalHyprland.get_default();
        this._workspaces = createBinding(this.default, "workspaces")(workspaces => workspaces.sort((a, b) => a.id - b.id).map(w => new HyprWorkspace(w)));
        this._focusedWorkspace = createBinding(this.default, "focusedWorkspace")(fw => new HyprWorkspace(fw));
        this._clients = createBinding(this.default, "clients")(cs => cs.map(c => new HyprClient(c)));
        this._focusedClient = createBinding(this.default, "focusedClient")(c => new HyprClient(c));

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

    private areMonitorsEqual(monitor: Gdk.Monitor, compMonitor: AstalHyprland.Monitor) {
        const geometry = monitor.get_geometry();
        if(compMonitor.model === monitor.get_model()
        && compMonitor.get_x() === geometry.x
        && compMonitor.get_y() === geometry.y) {
            return true;
        }
        return false;
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        return new HyprMonitor(this.default.get_monitors().find(compMonitor => this.areMonitorsEqual(monitor, compMonitor))!);
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
        const newState = val ?? this.getAnimationState();
        try {
            exec(`hyprctl keyword animations:enabled ${newState ? 1 : 0}`);
            exec(`hyprctl keyword decoration:shadow:enabled ${newState ? 1 : 0}`);
        } catch (error) {
            console.error("Erro ao alterar animações:", error);
        }
    }
}
