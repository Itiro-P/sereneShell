import { Gtk } from "ags/gtk4";
import compositorManager, { CompositorMonitor, CompositorWorkspace } from "../services/CompositorManager";
import { Accessor, For } from "ags";

class WorkspacesClass {
    private readonly maxWorkspaces: number = 10;
    public constructor() {

    }

    private Workspace({ workspace }: { workspace: CompositorWorkspace }) {
        return (
            <button
                cssClasses={compositorManager.focusedWorkspace.as(focused => ["Workspace", workspace.get_id() === focused.get_id() ? "Active" : "Inactive"])}
                onClicked={() => { if(compositorManager.focusedWorkspace.get().get_id() !== workspace.get_id()) workspace.focus() }}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                label={workspace.get_id().toString()}
            />
        );
    }

    private WorkspacePopover({ theRest }: { theRest: Accessor<CompositorWorkspace[]> }) {
        return (
            <popover cssClasses={["WorkspacePopover"]}>
                <Gtk.FlowBox maxChildrenPerLine={4}>
                    <For each={theRest} children={item => this.Workspace({ workspace: item })} />
                </Gtk.FlowBox>
            </popover>
        );
    }

    private MoreWorkspacesButton({ theRest }: { theRest: Accessor<CompositorWorkspace[]> }) {
        return (
            <menubutton
                cssClasses={["MoreWorkspacesButton"]}
                sensitive={theRest.as(tr => tr.length > 0)}
                popover={this.WorkspacePopover({ theRest: theRest }) as Gtk.Popover}
            >
                <label label={'󰕏'} />
            </menubutton>
        );
    }

    public Workspaces({ monitor }: { monitor: CompositorMonitor }) {
        const monitorWorkspaces = compositorManager.workspaces.as(ws => {
            const filtered = ws.filter((workspace) => workspace.get_monitor() === monitor);
            return {
                main: filtered.slice(0, this.maxWorkspaces),
                theRest: filtered.slice(this.maxWorkspaces)
            };
        });

        return (
            <box cssClasses={["Workspaces"]}>
                <box>
                    <For each={monitorWorkspaces.as(mw => mw.main)} children={(w: CompositorWorkspace) => this.Workspace({ workspace: w })} />
                </box>
                {this.MoreWorkspacesButton({ theRest: monitorWorkspaces.as(({ theRest }) => theRest) })}
            </box>
        );
    }
}

const workspaces = new WorkspacesClass;

export default workspaces;
