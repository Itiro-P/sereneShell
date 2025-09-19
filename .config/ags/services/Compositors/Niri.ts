import AstalNiri from "gi://AstalNiri?version=0.1";
import { IClient, ICompositor, IMonitor, IWorkspace } from "../../types";
import { Accessor, createBinding } from "ags";
import { Gdk } from "ags/gtk4";

class NiriContext {
    private _niri: AstalNiri.Niri;
    public workspaces: Accessor<AstalNiri.Workspace[]>;
    public focusedWorkspace: Accessor<AstalNiri.Workspace>;
    public windows: Accessor<AstalNiri.Window[]>;
    public focusedWindow: Accessor<AstalNiri.Window>;
    public focusedOutput: Accessor<AstalNiri.Output>;

    constructor(niri: AstalNiri.Niri) {
        this._niri = niri;
        this.workspaces = createBinding(niri, "workspaces")(ws => ws.sort((a, b) => a.get_id() - b.get_id()));
        this.focusedWorkspace = createBinding(niri, "focusedWorkspace");
        this.windows = createBinding(niri, "windows");
        this.focusedWindow = createBinding(niri, "focusedWindow");
        this.focusedOutput = createBinding(niri, "focusedOutput");
    }

    public getNiri() {
        return this._niri;
    }
}

export class NiriClient implements IClient {
    private _client: AstalNiri.Window;
    private _context: NiriContext;
    public title: Accessor<string>;
    public initialTitle: Accessor<string>;
    public class: Accessor<string>;
    public initialClass: Accessor<string>;
    public isFocused: Accessor<boolean>;

    constructor(client: AstalNiri.Window, context: NiriContext) {
        this._client = client;
        this._context = context;

        // AstalNiri tem limitações - usando title como fallback
        this.title = createBinding(client, "title");
        this.initialTitle = createBinding(client, "title");
        this.class = createBinding(client, "app_id");
        this.initialClass = createBinding(client, "app_id");

        // Usa o context para determinar foco
        this.isFocused = this._context.focusedWindow(fw => fw === client);
    }

    public focus() {
        // O ID 0 pode ser um placeholder - verificar documentação do Niri
        this._client.focus(0);
    }
}

export class NiriWorkspace implements IWorkspace {
    private _workspace: AstalNiri.Workspace;
    private _context: NiriContext;
    public id: Accessor<number>;
    public clients: Accessor<IClient[]>;
    public isFocused: Accessor<boolean>;

    constructor(workspace: AstalNiri.Workspace, context: NiriContext) {
        this._workspace = workspace;
        this._context = context;
        this.id = createBinding(workspace, "id");
        this.clients = createBinding(workspace, "windows")(windows => windows.map(w => new NiriClient(w, context)));
        this.isFocused = createBinding(workspace, "isFocused");
    }

    public focus() {
        this._workspace.focus();
    }
}

export class NiriMonitor implements IMonitor {
    private _monitor: AstalNiri.Output;
    private _context: NiriContext;
    public geometry: { x: number; y: number; width: number; height: number; };
    public model: string;
    public workspaces: Accessor<IWorkspace[]>;
    public focusedWorkspace: Accessor<IWorkspace>;
    public isFocused: Accessor<boolean>;

    constructor(monitor: AstalNiri.Output, context: NiriContext) {
        this._monitor = monitor;
        this._context = context;
        this.model = monitor.get_model();

        const logical = monitor.get_logical()!;
        this.geometry = {
            x: logical.get_x(),
            y: logical.get_y(),
            width: logical.get_width(),
            height: logical.get_height()
        }

        this.workspaces = this._context.workspaces(ws => ws.filter(w => w.get_output() === monitor.get_model()).map(w => new NiriWorkspace(w, context)));

        // Busca workspace focado deste monitor
        this.focusedWorkspace = createBinding(monitor, "workspaces")(aw => new NiriWorkspace(aw.find(w => w.get_is_focused())!, context));

        this.isFocused = this._context.focusedOutput(fo => fo === monitor);
    }

    public focus() {
        this._monitor.focus();
    }
}

export class Niri implements ICompositor {
    private _context: NiriContext;
    private _workspaces: Accessor<IWorkspace[]>;
    private _focusedWorkspace: Accessor<IWorkspace>;
    private _clients: Accessor<IClient[]>;
    private _focusedClient: Accessor<IClient>;

    public constructor() {
        const niriInstance = AstalNiri.get_default();
        this._context = new NiriContext(niriInstance);

        this._workspaces = this._context.workspaces(workspaces => workspaces.map(w => new NiriWorkspace(w, this._context)));

        this._focusedWorkspace = this._context.focusedWorkspace(fw => new NiriWorkspace(fw, this._context));

        this._clients = this._context.windows(windows => windows.map(w => new NiriClient(w, this._context)));

        this._focusedClient = this._context.focusedWindow(w => new NiriClient(w, this._context));
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

    private areMonitorsEqual(monitor: Gdk.Monitor, compMonitor: AstalNiri.Output): boolean {
        const geometry = monitor.get_geometry();
        const logical = compMonitor.get_logical();

        if (!logical) return false;

        return compMonitor.get_model() === monitor.get_model()
            && logical.get_x() === geometry.x
            && logical.get_y() === geometry.y;
    }

    public getCompositorMonitor(monitor: Gdk.Monitor): IMonitor {
        const compMonitor = this._context.getNiri().get_outputs().find(cm => this.areMonitorsEqual(monitor, cm));

        if (!compMonitor) {
            throw new Error(`Monitor compositor não encontrado: ${monitor.get_model()}`);
        }

        return new NiriMonitor(compMonitor, this._context);
    }

    public getAnimationState(): boolean {
        // Niri pode não ter controle de animações via API
        // Retorna false como padrão ou implementa verificação específica
        return false;
    }

    public toggleAnimations(val?: boolean): void {
        // Implementação específica para Niri se disponível
        // Por enquanto, apenas log
        console.log(`Niri: toggleAnimations called with ${val}`);
    }
}
