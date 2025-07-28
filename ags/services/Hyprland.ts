import { Accessor, createBinding, createComputed } from "ags";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export default class Hyprland {
    private static _instance: Hyprland;
    private default: AstalHyprland.Hyprland;
    private _workspaces: Accessor<AstalHyprland.Workspace[]>;
    private _focusedWorkspace: Accessor<AstalHyprland.Workspace>;
    private _clients: Accessor<AstalHyprland.Client[]>;
    private _focusedClient: Accessor<AstalHyprland.Client>;
    private _hasNoClients: Accessor<boolean>;

    private constructor() {
        this.default = AstalHyprland.get_default();
        this._workspaces = createBinding(this.default, "workspaces").as((workspaces) => workspaces.sort((a, b) => a.id - b.id));
        this._focusedWorkspace = createBinding(this.default, "focusedWorkspace");
        this._clients = createBinding(this.default, "clients");
        this._focusedClient = createBinding(this.default, "focusedClient");
        this._hasNoClients = this.focusedClient.as(fc => !fc);
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

    public get hasNoClients() {
        return this._hasNoClients;
    }
}
