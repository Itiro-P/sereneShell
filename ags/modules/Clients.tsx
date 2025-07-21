import { createComputed, For, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { clients, focusedClient } from "../services/Hyprland";

const filteredClients = createComputed([clients, focusedClient], (allClients, focused) => {
    return focused ? allClients.filter(client => client.address !== focused.address) : allClients;
});

const activeClientTitle = createComputed([filteredClients, focusedClient], (clients, focused) => focused?.title || `${clients.length}`);

const hasMultipleClients = filteredClients.as(clients => clients.length > 0);

function ActiveClient() {
    return (
        <label cssClasses={["Client"]} widthChars={24} maxWidthChars={21} ellipsize={3} label={activeClientTitle} />
    );
}

function ClientEntry(client: AstalHyprland.Client) {
    const click = new Gtk.GestureClick();
    const handler_id = click.connect("pressed", () => {client.focus()});

    onCleanup(() => { if(handler_id) click.disconnect(handler_id) });
    return (
        <label cssClasses={["ClientEntry"]} $={self => self.add_controller(click)} maxWidthChars={22} ellipsize={3} label={client.title} />
    );
}

function ClientsPopover() {
    return (
        <box cssClasses={["ClientsPopover"]} orientation={Gtk.Orientation.VERTICAL}>
            <For each={filteredClients} children={client => ClientEntry(client)} />
        </box>
    );
}

export default function Clients() {
    return (
        <menubutton cssClasses={["Clients"]} sensitive={hasMultipleClients} popover={<popover><ClientsPopover /></popover> as Gtk.Popover}>
            <ActiveClient />
        </menubutton>
    );
}
