import { Accessor, createComputed, For } from "ags";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import hyprlandService from "../services/Hyprland";
import Pango from "gi://Pango?version=1.0";

class ClientsClass {
    private filteredClients: Accessor<AstalHyprland.Client[]>;
    private activeClientTitle: Accessor<string>;

    public constructor() {
        this.filteredClients = createComputed([hyprlandService.clients, hyprlandService.focusedClient],
            (allClients, focused) => focused !== null ? allClients.filter(client => client.address !== focused.address) : allClients);
        this.activeClientTitle = createComputed([this.filteredClients, hyprlandService.focusedClient], (clients, focused) => focused?.title || `${clients.length}`);
    }

    public get ActiveClient() {
        return (
            <label
                cssClasses={["ActiveClient"]}
                widthChars={24}
                maxWidthChars={21}
                ellipsize={Pango.EllipsizeMode.END}
                label={this.activeClientTitle}
            />
        );
    }
}

const clients = new ClientsClass;

export default clients;
