import { Accessor, createComputed, For, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Hyprland from "../services/Hyprland";

export default class Clients {
    private static _instance: Clients;
    private filteredClients: Accessor<AstalHyprland.Client[]>;
    private activeClientTitle: Accessor<string>;
    private hasMultipleClients: Accessor<boolean>;

    private constructor() {
        this.filteredClients = createComputed([Hyprland.instance.clients, Hyprland.instance.focusedClient], (allClients, focused) => {
            return focused ? allClients.filter(client => client.address !== focused.address) : allClients;
        });
        this.activeClientTitle = createComputed([this.filteredClients, Hyprland.instance.focusedClient], (clients, focused) => focused?.title || `${clients.length}`);
        this.hasMultipleClients = this.filteredClients.as(clients => clients.length > 0);
    }

    private ClientEntry(client: AstalHyprland.Client) {
        const click = new Gtk.GestureClick();
        const handler_id = click.connect("pressed", () => {client.focus()});

        onCleanup(() => { if(handler_id) click.disconnect(handler_id) });
        return (
            <label cssClasses={["ClientEntry"]} $={self => self.add_controller(click)} maxWidthChars={22} ellipsize={3} label={client.title} />
        );
    }

    private ClientsPopover() {
        return (
            <popover cssClasses={["ClientsPopover"]}>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    <For each={this.filteredClients} children={client => this.ClientEntry(client)} />
                </box>
            </popover>
        );
    }

    public static get instance() {
        if(!this._instance) {
            this._instance = new Clients;
        }
        return this._instance;
    }

    public get Clients() {
        return (
            <menubutton cssClasses={["Clients"]} sensitive={this.hasMultipleClients} popover={this.ClientsPopover() as Gtk.Popover}>
                <label cssClasses={["Client"]} widthChars={24} maxWidthChars={21} ellipsize={3} label={this.activeClientTitle} />
            </menubutton>
        );
    }
}
