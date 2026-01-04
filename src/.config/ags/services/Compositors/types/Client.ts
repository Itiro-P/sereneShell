import { Accessor } from "ags";

export interface IClient {
    focus: () => void;
    title: Accessor<string>;
    initialTitle: Accessor<string>;
    class: Accessor<string>;
    initialClass: Accessor<string>;
    isFocused: Accessor<boolean>;
}
