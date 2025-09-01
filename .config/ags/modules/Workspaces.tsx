import { Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import compositorManager, { CompositorMonitor, CompositorWorkspace } from "../services/CompositorManager";
import { Accessor, createBinding, createComputed, For, onCleanup } from "ags";

class WorkspacesClass {
    private readonly maxWorkspaces: number = 10;
    public constructor() {

    }

    private Workspace({ workspace, isInPopover = false }: { workspace: CompositorWorkspace, isInPopover: boolean }) {
        const click = new Gtk.GestureClick();
        const handler_id = click.connect("pressed", () => { if(compositorManager.focusedWorkspace.get().get_id() !== workspace.get_id()) workspace.focus() });
        onCleanup(() => { if (handler_id) click.disconnect(handler_id) });

        return (
            <label
                $={self => self.add_controller(click)}
                cssClasses={compositorManager.focusedWorkspace.as(focused => ["Workspace", workspace.get_id() === focused.get_id() ? "Active" : "Inactive"])}
                label={`${workspace.get_id()}`} widthChars={3} maxWidthChars={3} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
            />
        );
    }

    private MainWorkspace(workspace: CompositorWorkspace) {
        const click = new Gtk.GestureClick();
        const handler = click.connect("pressed", () => {
            if (workspace.get_id() !== compositorManager.focusedWorkspace.get().get_id()) workspace.focus();
        });

        onCleanup(() => { if (click) click.disconnect(handler) });
        return (
            <label
                $={(self) => self.add_controller(click)}
                cssClasses={createComputed([compositorManager.focusedWorkspace, createBinding(workspace, "id")], (focused, id) => ["Workspace", id === focused?.get_id() ? "Active" : "Inactive"])}
                label={workspace.get_id().toString()}
                widthChars={1}
                maxWidthChars={1}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            />
        );
    }

    private WorkspacePopover({ theRest }: { theRest: Accessor<CompositorWorkspace[]> }) {
        return (
            <popover cssClasses={["WorkspacePopover"]}>
                <Gtk.FlowBox maxChildrenPerLine={4}>
                    <For each={theRest} children={item => this.Workspace({ workspace: item, isInPopover: true })} />
                </Gtk.FlowBox>
            </popover>
        );
    }

    private MoreWorkspacesButton({ theRest }: { theRest: Accessor<CompositorWorkspace[]> }) {
        return (
            <menubutton cssClasses={["MoreWorkspacesButton"]} sensitive={theRest.as(tr => tr.length > 0)} popover={this.WorkspacePopover({ theRest: theRest }) as Gtk.Popover}>
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
                    <For each={monitorWorkspaces.as(mw => mw.main)} children={(w: CompositorWorkspace) => this.MainWorkspace(w)} />
                </box>
                {this.MoreWorkspacesButton({ theRest: monitorWorkspaces.as(({ theRest }) => theRest) })}
            </box>
        );
    }
}

const workspaces = new WorkspacesClass;

export default workspaces;
