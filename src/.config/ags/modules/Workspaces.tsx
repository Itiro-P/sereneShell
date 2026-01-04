import { Gdk, Gtk } from "ags/gtk4";
import { compositorService, iconFinderService, IClient, IMonitor, IWorkspace } from "../services";
import { Accessor, createComputed, For } from "ags";

export namespace Workspaces {

    function Client({ client }: { client: IClient }) {
        const tooltip = createComputed(() => `<b>${client.title()}</b>\n${client.initialTitle()}`);

        return (
            <button
                cssClasses={client.isFocused(is => ["WorkspaceClient", is ? "CFocused" : ""])}
                iconName={iconFinderService.findIcon(client.initialClass.peek())}
                tooltipMarkup={tooltip}
                onClicked={() => { if(compositorService.focusedClient?.peek() !== client) client.focus() }}
            />
        );
    }

    function Workspace({ workspace }: { workspace: IWorkspace }) {
        const clients = workspace.clients;
        const hasClients = clients(cs => cs.length > 0);

        function focusWorkspace() {
            if (compositorService.focusedWorkspace?.peek().id.peek() !== workspace.id.peek()) {
                workspace.focus()
            }
        }

        return (
            <box cssClasses={workspace.isFocused(is => ["Workspace", is ? "WFocused" : ""])}>
             <Gtk.GestureClick
                    button={Gdk.BUTTON_SECONDARY}
                    onPressed={() => focusWorkspace()}
                />
                <button
                    cssClasses={["WorkspaceIdButton"]}
                    onClicked={() => focusWorkspace()}
                    visible={hasClients(hs => !hs)}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    label={workspace.id(id => id.toString())}
                />

                <box cssClasses={["Clients"]} visible={hasClients}>
                    <For each={clients} children={c => <Client client={c} />} />
                </box>
            </box>
        );
    }

    export function Workspaces({ monitor }: { monitor: IMonitor }) {
        const workspaces = monitor.workspaces;

        return (
            <box cssClasses={["Workspaces"]}>
                <For each={workspaces} children={w => <Workspace workspace={w} />} />
            </box>
        );
    }
}
