import { Gtk } from "ags/gtk4";
import compositorManager, { CompositorClient, CompositorMonitor, CompositorWorkspace } from "../services/CompositorManager";
import { Accessor, createBinding, For } from "ags";
import iconFinder from "../services/IconFinder";
import AstalHyprland from "gi://AstalHyprland?version=0.1";


class WorkspacesClass {
    private readonly maxWorkspaces: number = 10;
    public constructor() {
    }

    private WorkspaceClient(client: CompositorClient) {
        const isFocused = compositorManager.focusedClient(fc => fc === client);
        return (
            <button
                cssClasses={isFocused(is => ["WorkspaceClient", is ? "CFocused" : ""])}
                iconName={iconFinder.findIcon(client.get_initial_class())}
                tooltipMarkup={`<b>${client.get_title()}</b>\n<i>${client.get_initial_class()}</i>`}
                onClicked={() => { if(compositorManager.focusedClient.get() !== client) client.focus() }}
            />
        );
    }

    private Workspace(workspace: CompositorWorkspace) {
        const isFocused = compositorManager.focusedWorkspace(ws => ws === workspace);
        const clients = createBinding(workspace, "clients")(cs => cs.filter(c => !c.get_pinned()));
        return (
            <box cssClasses={isFocused(is => ["Workspace", is ? "WFocused" : ""])}>
                <button
                    cssClasses={["WorkspaceIdButton"]}
                    onClicked={() => { if(compositorManager.focusedWorkspace.get().get_id() !== workspace.get_id()) workspace.focus() }}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    label={workspace.get_id().toString()}
                />
                <box cssClasses={["Clients"]} visible={clients(cs => cs.length > 0 && cs.length < 6)}>
                    <For each={clients} children={(client: AstalHyprland.Client) => this.WorkspaceClient(client)} />
                </box>
            </box>
        );
    }

    private WorkspacePopover(theRest: Accessor<CompositorWorkspace[]>) {
        return (
            <popover cssClasses={["WorkspacePopover"]}>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    <For each={theRest} children={item => this.Workspace(item)} />
                </box>
            </popover>
        );
    }

    private MoreWorkspacesButton(theRest: Accessor<CompositorWorkspace[]>) {
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

    public Workspaces(monitor: CompositorMonitor) {
        const monitorWorkspaces = compositorManager.workspaces(ws => {
            const filtered = ws.filter(workspace => workspace.get_monitor() === monitor);
            return {
                main: filtered.slice(0, this.maxWorkspaces),
                theRest: filtered.slice(this.maxWorkspaces)
            };
        });

        return (
            <box cssClasses={["Workspaces"]}>
                <box>
                    <For each={monitorWorkspaces(mw => mw.main)} children={(w: CompositorWorkspace) => this.Workspace(w)} />
                </box>
                {this.MoreWorkspacesButton(monitorWorkspaces(mw => mw.theRest))}
            </box>
        );
    }
}

const workspaces = new WorkspacesClass;

export default workspaces;
