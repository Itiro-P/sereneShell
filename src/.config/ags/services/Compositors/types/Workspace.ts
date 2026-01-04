import { Accessor } from "ags";
import { IClient } from "./Client";

export interface IWorkspace {
    focus: () => void;
    clients: Accessor<IClient[]>;
    id: Accessor<number>;
    isFocused: Accessor<boolean>;
}
