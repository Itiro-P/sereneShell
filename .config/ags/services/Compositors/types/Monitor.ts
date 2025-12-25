import { Accessor } from "ags";
import { IWorkspace } from "./Workspace";

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
