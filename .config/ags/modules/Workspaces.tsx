import { Gdk, Gtk } from "ags/gtk4";
import { compositorManager, iconFinder } from "../services";
import { Accessor, createComputed, For } from "ags";
import { IClient, IMonitor, IWorkspace } from "../types";

class WorkspacesClass {
    public constructor() {
    }

    private WorkspaceClient(client: IClient) {
        const tooltip = createComputed(() => `<b>${client.title()}</b>\n${client.initialTitle()}`);

        return (
            <button
                cssClasses={client.isFocused(is => ["WorkspaceClient", is ? "CFocused" : ""])}
                iconName={iconFinder.findIcon(client.initialClass.peek())}
                tooltipMarkup={tooltip}
                onClicked={() => { if(compositorManager.focusedClient?.peek() !== client) client.focus() }}
            />
        );
    }

    private Workspace(workspace: IWorkspace) {
        const clients = workspace.clients;
        const hasClients = clients(cs => cs.length > 0);

        function focusWorkspace() {
            if (compositorManager.focusedWorkspace?.peek().id.peek() !== workspace.id.peek()) {
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
                    <For each={clients} children={(client: IClient) => this.WorkspaceClient(client)} />
                </box>
            </box>
        );
    }

    public Workspaces(monitor: IMonitor) {
        const workspaces = monitor.workspaces;

        return (
            <box cssClasses={["Workspaces"]}>
                <For each={workspaces} children={w => this.Workspace(w)} />
            </box>
        );
    }
}

const workspaces = new WorkspacesClass;

export default workspaces;
