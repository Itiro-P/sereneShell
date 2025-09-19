import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { IClient, ICompositor, IMonitor, IWorkspace } from "../../types";
import { Accessor, createBinding } from "ags";
import { exec } from "ags/process";
import settingsService from "../Settings";
import { Gdk } from "ags/gtk4";

// Context class para gerenciar dependências compartilhadas
class HyprlandContext {
    private _hyprland: AstalHyprland.Hyprland;
    public workspaces: Accessor<AstalHyprland.Workspace[]>;
    public focusedClient: Accessor<AstalHyprland.Client>;
    public focusedWorkspace: Accessor<AstalHyprland.Workspace>;
    public focusedMonitor: Accessor<AstalHyprland.Monitor>;

    constructor(hyprland: AstalHyprland.Hyprland) {
        this._hyprland = hyprland;
        this.workspaces = createBinding(hyprland, "workspaces");
        this.focusedClient = createBinding(hyprland, "focusedClient");
        this.focusedWorkspace = createBinding(hyprland, "focusedWorkspace");
        this.focusedMonitor = createBinding(hyprland, "focusedMonitor");
    }

    public getHyprland() {
        return this._hyprland;
    }
}

export class HyprClient implements IClient {
    private _client: AstalHyprland.Client;
    private _context: HyprlandContext;
    public title: Accessor<string>;
    public initialTitle: Accessor<string>;
    public class: Accessor<string>;
    public initialClass: Accessor<string>;
    public isFocused: Accessor<boolean>;

    constructor(client: AstalHyprland.Client, context: HyprlandContext) {
        this._client = client;
        this._context = context;
        this.title = createBinding(client, "title");
        this.initialTitle = createBinding(client, "initialTitle");
        this.class = createBinding(client, "class");
        this.initialClass = createBinding(client, "initialClass");
        this.isFocused = this._context.focusedClient(fc => fc === client);
    }

    public focus() {
        this._client.focus();
    }
}

export class HyprWorkspace implements IWorkspace {
    private _workspace: AstalHyprland.Workspace;
    private _context: HyprlandContext;
    public id: Accessor<number>;
    public clients: Accessor<IClient[]>;
    public isFocused: Accessor<boolean>;

    constructor(workspace: AstalHyprland.Workspace, context: HyprlandContext) {
        this._workspace = workspace;
        this._context = context;
        this.id = createBinding(workspace, "id");
        this.clients = createBinding(workspace, "clients")(cs => cs.map(c => new HyprClient(c, context)));
        this.isFocused = this._context.focusedWorkspace(fw => fw === workspace);
    }

    public focus() {
        this._workspace.focus();
    }
}

export class HyprMonitor implements IMonitor {
    private _monitor: AstalHyprland.Monitor;
    private _context: HyprlandContext;
    public geometry: { x: number; y: number; width: number; height: number; };
    public model: string;
    public workspaces: Accessor<IWorkspace[]>;
    public focusedWorkspace: Accessor<IWorkspace>;
    public isFocused: Accessor<boolean>;

    constructor(monitor: AstalHyprland.Monitor, context: HyprlandContext) {
        this._monitor = monitor;
        this._context = context;
        this.model = monitor.get_model();
        this.geometry = {
            x: monitor.get_x(),
            y: monitor.get_y(),
            width: monitor.get_width(),
            height: monitor.get_height()
        };

        // Usar context ao invés de membro estático
        this.workspaces = this._context.workspaces(ws =>
            ws.filter(w => w.get_monitor() === monitor).sort((a, b) => a.get_id() - b.get_id()).map(w => new HyprWorkspace(w, context))
        );

        this.focusedWorkspace = createBinding(monitor, "activeWorkspace")(aw =>
            new HyprWorkspace(aw, context)
        );

        this.isFocused = this._context.focusedMonitor(fm => fm === monitor);
    }

    public focus() {
        this._monitor.focus();
    }
}

export class Hyprland implements ICompositor {
    private _context: HyprlandContext;
    private _workspaces: Accessor<IWorkspace[]>;
    private _focusedWorkspace: Accessor<IWorkspace>;
    private _clients: Accessor<IClient[]>;
    private _focusedClient: Accessor<IClient>;

    public constructor() {
        const hyprlandInstance = AstalHyprland.get_default();
        this._context = new HyprlandContext(hyprlandInstance);

        this._workspaces = this._context.workspaces(workspaces =>
            workspaces.sort((a, b) => a.id - b.id).map(w => new HyprWorkspace(w, this._context))
        );

        this._focusedWorkspace = this._context.focusedWorkspace(fw =>
            new HyprWorkspace(fw, this._context)
        );

        this._clients = createBinding(hyprlandInstance, "clients")(cs =>
            cs.map(c => new HyprClient(c, this._context))
        );

        this._focusedClient = this._context.focusedClient(c =>
            new HyprClient(c, this._context)
        );

        // Aplicar configurações de animação
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
        return compMonitor.model === monitor.get_model()
            && compMonitor.get_x() === geometry.x
            && compMonitor.get_y() === geometry.y;
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        const compMonitor = this._context.getHyprland()
            .get_monitors()
            .find(cm => this.areMonitorsEqual(monitor, cm));

        if (!compMonitor) {
            throw new Error("Monitor compositor não encontrado");
        }

        return new HyprMonitor(compMonitor, this._context);
    }

    public getAnimationState() {
        try {
            const result = exec("hyprctl getoption animations:enabled -j");
            return JSON.parse(result).int === 1;
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
