import { Accessor, createBinding } from "ags";
import AstalTray from "gi://AstalTray?version=0.1";


class TrayClass {
    private _default: AstalTray.Tray;
    private _items: Accessor<AstalTray.TrayItem[]>;

    public constructor() {
        this._default = AstalTray.get_default();
        this._items = createBinding(this._default, "items");
    }

    public get items() {
        return this._items;
    }
}

export const trayService = new TrayClass;
