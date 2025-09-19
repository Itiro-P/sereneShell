import { Accessor } from "ags";
import { Gdk } from "ags/gtk4";

export interface IClient {
    focus: () => void;
    title: Accessor<string>;
    initialTitle: Accessor<string>;
    class: Accessor<string>;
    initialClass: Accessor<string>;
    isFocused: Accessor<boolean>;
}

export interface IWorkspace {
    focus: () => void;
    clients: Accessor<IClient[]>;
    id: Accessor<number>;
    isFocused: Accessor<boolean>;
}

export interface IMonitor {
    focus: () => void;
    geometry: {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    model: string;
    workspaces: Accessor<IWorkspace[]>;
    focusedWorkspace: Accessor<IWorkspace>;
    isFocused: Accessor<boolean>;
}

export interface ICompositor {
    getWorkspaces: () => Accessor<IWorkspace[]>;
    getFocusedWorkspace: () => Accessor<IWorkspace>;
    getClients: () => Accessor<IClient[]>;
    getFocusedClient: () => Accessor<IClient>;
    getCompositorMonitor: (monitor: Gdk.Monitor) => IMonitor;
    getAnimationState: () => boolean;
    toggleAnimations: (val?: boolean) => void;
}
