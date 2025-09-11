import { Gtk } from "ags/gtk4";
import compositorManager, { CompositorClient, CompositorMonitor, CompositorWorkspace } from "../services/CompositorManager";
import { Accessor, createBinding, For } from "ags";

class WorkspacesClass {
    private readonly maxWorkspaces: number = 10;
    public constructor() {
    }

    private WorkspaceClient(client: CompositorClient) {
        const isFocused = compositorManager.focusedClient(fc => fc === client);
        return (
            <button cssClasses={isFocused(is => ["WorkspaceClient", is ? "Active" : "Inactive"])}
                label={createBinding(client, "pid")(pid => pid.toString()[0])}
                onClicked={() => { if(compositorManager.focusedClient.get().get_pid() !== client.get_pid()) client.focus() }}
            />
        );
    }

    private Workspace(workspace: CompositorWorkspace) {
        const isFocused = compositorManager.focusedWorkspace(ws => ws === workspace);
        return (
            <button
                cssClasses={isFocused(is => ["Workspace", is ? "Active" : "Inactive"])}
                onClicked={() => { if(compositorManager.focusedWorkspace.get().get_id() !== workspace.get_id()) workspace.focus() }}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                label={workspace.get_id().toString()}
            />
        );
    }

    private WorkspacePopover(theRest: Accessor<CompositorWorkspace[]>) {
        return (
            <popover cssClasses={["WorkspacePopover"]}>
                <Gtk.FlowBox maxChildrenPerLine={4}>
                    <For each={theRest} children={item => this.Workspace(item)} />
                </Gtk.FlowBox>
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
