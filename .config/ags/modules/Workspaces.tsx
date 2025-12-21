import { Gdk, Gtk } from "ags/gtk4";
import compositorManager from "../services/CompositorManager";
import { Accessor, createComputed, For } from "ags";
import iconFinder from "../services/IconFinder";
import { IClient, IMonitor, IWorkspace } from "../types";


class WorkspacesClass {
    private readonly maxWorkspaces: number = 5;
    public constructor() {
    }

    private WorkspaceClient(client: IClient) {
        const tooltip = createComputed(() => `<b>${client.title()}</b>\n${client.initialTitle()}`);

        return (
            <button
                cssClasses={client.isFocused(is => ["WorkspaceClient", is ? "CFocused" : ""])}
                iconName={iconFinder.findIcon(client.initialClass.peek())}
                tooltipMarkup={tooltip}
                onClicked={() => {
                    if(compositorManager.focusedClient?.peek() !== client) client.focus()
                }}
            />
        );
    }

    private Workspace(workspace: IWorkspace) {
        const clients = workspace.clients;
        const clientCount = clients(cs => cs.length > 0 && cs.length < 5);
        return (
            <box cssClasses={workspace.isFocused(is => ["Workspace", is ? "WFocused" : ""])}>
                <Gtk.GestureClick
                    button={Gdk.BUTTON_SECONDARY}
                    onPressed={() => { if (compositorManager.focusedWorkspace?.peek().id.peek() !== workspace.id.peek()) workspace.focus() }}
                />
                <button
                    cssClasses={["WorkspaceIdButton"]}
                    onClicked={() => { if (compositorManager.focusedWorkspace?.peek().id.peek() !== workspace.id.peek()) workspace.focus() }}
                    visible={clientCount(cc => !cc)}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    label={workspace.id(id => id.toString())}
                />

                <box cssClasses={["Clients"]} visible={clientCount}>
                    <For each={clients} children={(client: IClient) => this.WorkspaceClient(client)} />
                </box>
            </box>
        );
    }

    private WorkspacePopover(theRest: Accessor<IWorkspace[]>) {
        return (
            <popover cssClasses={["WorkspacePopover"]}>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    <For each={theRest} children={item => this.Workspace(item)} />
                </box>
            </popover>
        );
    }

    private MoreWorkspacesButton(theRest: Accessor<IWorkspace[]>) {
        return (
            <menubutton
                cssClasses={["MoreWorkspacesButton"]}
                sensitive={theRest(tr => tr.length > 0)}
                popover={this.WorkspacePopover(theRest) as Gtk.Popover}
            >
                <label label={'󰕏'} />
            </menubutton>
        );
    }

    public Workspaces(monitor: IMonitor) {
        const monitorWorkspaces = monitor.workspaces(ws => {
            return { main: ws.slice(0, this.maxWorkspaces), theRest: ws.slice(this.maxWorkspaces) };
        });
        return (
            <box cssClasses={["Workspaces"]}>
                <box>
                    <For each={monitorWorkspaces(mw => mw.main)} children={(w: IWorkspace) => this.Workspace(w)} />
                </box>
                {this.MoreWorkspacesButton(monitorWorkspaces(mw => mw.theRest))}
            </box>
        );
    }
}

const workspaces = new WorkspacesClass;

export default workspaces;
