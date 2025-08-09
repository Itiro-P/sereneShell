import { Accessor, createComputed, For, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import hyprlandService from "../services/Hyprland";

class ClientsClass {
    private filteredClients: Accessor<AstalHyprland.Client[]>;
    private activeClientTitle: Accessor<string>;
    private hasMultipleClients: Accessor<boolean>;

    public constructor() {
        this.filteredClients = createComputed([hyprlandService.clients, hyprlandService.focusedClient], (allClients, focused) => {
            return focused ? allClients.filter(client => client.address !== focused.address) : allClients;
        });
        this.activeClientTitle = createComputed([this.filteredClients, hyprlandService.focusedClient], (clients, focused) => focused?.title || `${clients.length}`);
        this.hasMultipleClients = this.filteredClients.as(clients => clients.length > 0);
    }

    private ClientEntry(client: AstalHyprland.Client) {
        const click = new Gtk.GestureClick();
        const handler_id = click.connect("pressed", () => {client.focus()});

        onCleanup(() => { if(handler_id) click.disconnect(handler_id) });
        return (
            <label cssClasses={["ClientEntry"]} $={self => self.add_controller(click)} maxWidthChars={22} ellipsize={3} label={client.get_title()} />
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

    public get Clients() {
        return (
            <menubutton cssClasses={["Clients"]} sensitive={this.hasMultipleClients} popover={this.ClientsPopover() as Gtk.Popover}>
                <label cssClasses={["Client"]} widthChars={24} maxWidthChars={21} ellipsize={3} label={this.activeClientTitle} />
            </menubutton>
        );
    }
}

const clients = new ClientsClass;

export default clients;
