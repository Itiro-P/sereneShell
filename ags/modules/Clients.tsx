import { createComputed, For, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { clients, focusedClient, hyprland } from "../services/Hyprland";

const filteredClients = createComputed([clients, focusedClient], (allClients, focused) => {
    return focused ? allClients.filter(client => client.address !== focused.address) : allClients;
});

const activeClientTitle = createComputed([filteredClients, focusedClient], (clients, focused) => {
    const title = focused?.title || `${clients.length}`;
    return title;
});

const hasMultipleClients = createComputed([filteredClients], (clients) => {
    return clients.length > 0;
});

function setupClientClick(widget: Gtk.Widget, client: AstalHyprland.Client): { click: Gtk.GestureClick, handler_id: number } {
    const click = new Gtk.GestureClick();
    widget.add_controller(click);
    //const handler_id = click.connect("pressed", () => {hyprland.dispatch("focuswindow", `address:0x${clientAddress}`)});
    const handler_id = click.connect("pressed", () => {client.focus()});
    return { click, handler_id };
}

function ActiveClient() {
    return (
        <label cssClasses={["Client"]} widthChars={24} maxWidthChars={21} ellipsize={3} label={activeClientTitle} />
    );
}

function ClientEntry(client: AstalHyprland.Client) {
    let clickHandler: { click: Gtk.GestureClick, handler_id: number };
    onCleanup(() => { if(clickHandler) clickHandler.click.disconnect(clickHandler.handler_id) });
    return (
        <label cssClasses={["ClientEntry"]} $={self => clickHandler = setupClientClick(self, client)} maxWidthChars={22} ellipsize={3} label={client.title} />
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
