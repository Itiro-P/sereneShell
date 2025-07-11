import { bind, Variable } from "astal";
import { Gtk } from "astal/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

const hyprland = AstalHyprland.get_default();
const focusedClient = bind(hyprland, "focusedClient");
const clients = bind(hyprland, "clients");

const clientData = Variable.derive([clients, focusedClient], (allClients, focused) => {
    const filtered = focused ? allClients.filter(client => client.address !== focused.address) : allClients;
    const title = focused?.title?.replace(/^./, char => char.toUpperCase()) ?? allClients.length.toString();

    return {
        filtered,
        title,
        hasMultiple: allClients.length > 1
    };
});

const clientClickHandlers = new WeakMap<Gtk.Widget, Gtk.GestureClick>();

function setupClientClick(widget: Gtk.Widget, clientAddress: string) {
    if (!clientClickHandlers.has(widget)) {
        const click = new Gtk.GestureClick();
        click.connect("pressed", () => {hyprland.dispatch("focuswindow", `address:0x${clientAddress}`)});
        widget.add_controller(click);
        clientClickHandlers.set(widget, click);
    }
}

function ActiveClient() {
    return (
        <label
            cssClasses={["Client"]} widthChars={24} maxWidthChars={21} ellipsize={3}
            label={bind(clientData).as(({ title }) => title)}
        />
    );
}

function ClientEntry(client: AstalHyprland.Client) {
    return (
        <label cssClasses={["ClientEntry"]} setup={(self) => setupClientClick(self, client.address)} maxWidthChars={22} ellipsize={3}
            label={client.title.replace(/^./, char => char.toUpperCase())}
        />
    );
}

function ClientsPopover() {
    return (
        <box cssClasses={["ClientsPopover"]} orientation={Gtk.Orientation.VERTICAL}>
            {bind(clientData).as(({ filtered }) => filtered.map(client => ClientEntry(client)))}
        </box>
    );
}

export default function Clients() {
    return (
        <menubutton
            cssClasses={["Clients"]}
            sensitive={bind(clientData).as(({ hasMultiple }) => hasMultiple)}
            child={ActiveClient()}
            popover={<popover child={ClientsPopover()} /> as Gtk.Popover}
            onDestroy={() => {clientData.drop()}}
        />
    );
}
