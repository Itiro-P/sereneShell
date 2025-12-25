import { Accessor } from "ags";
import { Gdk } from "ags/gtk4";
import { IClient } from "./Client";
import { IMonitor } from "./Monitor";
import { IWorkspace } from "./Workspace";

export interface ICompositor {
    getWorkspaces: () => Accessor<IWorkspace[]>;
    getFocusedWorkspace: () => Accessor<IWorkspace>;
    getClients: () => Accessor<IClient[]>;
    getFocusedClient: () => Accessor<IClient>;
    getCompositorMonitor: (monitor: Gdk.Monitor) => Accessor<IMonitor | undefined>;
    getAnimationState: () => boolean;
    toggleAnimations: (val?: boolean) => void;
}
