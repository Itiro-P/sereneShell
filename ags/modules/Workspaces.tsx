import { Gtk, Gdk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { focusedWorkspace, workspaces } from "../services/Hyprland";
import { Accessor, createComputed, For, onCleanup } from "ags";

function Workspace({ workspace, isInPopover = false }: { workspace: AstalHyprland.Workspace, isInPopover: boolean }) {
    const baseClasses = isInPopover ? ["Workspace", "WorkspacePopoverItem"] : ["Workspace"];
    const click = new Gtk.GestureClick();
    const handler_id = click.connect("pressed", () => { if(focusedWorkspace.get().get_id() !== workspace.get_id()) workspace.focus() });
    onCleanup(() => { if (handler_id) click.disconnect(handler_id) });

    return (
        <label
            $={self => self.add_controller(click)}
            cssClasses={focusedWorkspace.as(focused => [...baseClasses, workspace.id === focused.id ? "Active" : "Inactive"])}
            label={`${workspace.id}`} widthChars={1} maxWidthChars={1} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
        />
    );
}

function MainWorkspace({ workspace }: { workspace: Accessor<AstalHyprland.Workspace> }) {
    const click = new Gtk.GestureClick();
    const handler = click.connect("pressed", () => {
        const ws = workspace.get();
        if (ws && ws.id !== focusedWorkspace.get().id) ws.focus();
    });

    onCleanup(() => { if (click) click.disconnect(handler) });
    return (
        <label
            $={(self) => self.add_controller(click)}
            cssClasses={createComputed([focusedWorkspace, workspace], (focused, ws) => ["Workspace", ws && ws.id === focused?.id ? "Active" : "Inactive"])}
            sensitive={workspace.as(w => !(!w))}
            label={workspace.as(w => `${w?.id ?? ' '}`)}
            widthChars={1}
            maxWidthChars={1}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
        />
    );
}

function WorkspacePopover({ theRest }: { theRest: Accessor<AstalHyprland.Workspace[]> }) {
    return (
        <popover cssClasses={["WorkspacePopover"]}>
            <box cssClasses={["WorkspacePopoverContent"]}>
                <Gtk.FlowBox maxChildrenPerLine={4}>
                    <For each={theRest} children={item => <Workspace workspace={item} isInPopover={true} />} />
                </Gtk.FlowBox>
            </box>
        </popover>
    );
}

function MoreWorkspacesButton({ theRest }: { theRest: Accessor<AstalHyprland.Workspace[]> }) {
    return (
        <menubutton cssClasses={["MoreWorkspacesButton"]} sensitive={theRest.as(tr => tr.length > 0)} popover={<WorkspacePopover theRest={theRest} /> as Gtk.Popover}>
            <label label={'+'} />
        </menubutton>
    );
}

export default function Workspaces({ monitor }: { monitor: Gdk.Monitor }) {
    const monitorWorkspaces = workspaces.as(ws => {
        const filtered = ws.filter((workspace) => workspace ? workspace?.get_monitor()?.get_model() === monitor.get_model() : false);
        return {
            first: filtered[0],
            second: filtered[1],
            third: filtered[2],
            theRest: filtered.slice(3)
        };
    });

    return (
        <box cssClasses={["Workspaces"]}>
            <MainWorkspace workspace={monitorWorkspaces.as(({ first }) => first)} />
            <MainWorkspace workspace={monitorWorkspaces.as(({ second }) => second)} />
            <MainWorkspace workspace={monitorWorkspaces.as(({ third }) => third)} />
            <MoreWorkspacesButton theRest={monitorWorkspaces.as(({ theRest }) => theRest)} />
        </box>
    );
}
