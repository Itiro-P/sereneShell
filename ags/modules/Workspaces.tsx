import { Gtk, Gdk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { focusedWorkspace, hyprland, workspaces } from "../services/Hyprland";
import { Accessor, createComputed, For, onCleanup } from "ags";

function setupWorkspaceClick(widget: Gtk.Widget, workspaceId: number): { click: Gtk.GestureClick, handler_id: number } {
    const click = new Gtk.GestureClick();
    widget.add_controller(click);
    const handler_id = click.connect("pressed", () => {
        if(focusedWorkspace.get().id !== workspaceId) hyprland.dispatch("workspace", `${workspaceId}`);
    });
    return { click, handler_id };
}

function Workspace({ workspace, isInPopover = false }: { workspace: AstalHyprland.Workspace, isInPopover: boolean }) {
    const baseClasses = isInPopover ? ["Workspace", "WorkspacePopoverItem"] : ["Workspace"];
    let clickHandler: { click: Gtk.GestureClick, handler_id: number };
    onCleanup(() => {if(clickHandler) clickHandler.click.disconnect(clickHandler.handler_id)})
    return (
        <label
            $={self => clickHandler = setupWorkspaceClick(self, workspace.id)}
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

function chunkArray(array: AstalHyprland.Workspace[], size: number): AstalHyprland.Workspace[][] {
    const result: AstalHyprland.Workspace[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

function WorkspacePopover({ theRest }: { theRest: Accessor<AstalHyprland.Workspace[]> }) {
    const chunkedArray = theRest.as(tr => chunkArray(tr, 4));
    return (
        <popover cssClasses={["WorkspacePopover"]}>
            <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["WorkspacePopoverContent"]}>
                <For each={chunkedArray}>
                    {line => {
                        return (
                            <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["WorkspacePopoverContentLine"]}>
                                {line.map(workspace => <Workspace workspace={workspace} isInPopover={true} />)}
                            </box>
                        );
                    }}
                </For>
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
    const monitorWorkspaces = createComputed([workspaces], (workspaces) => {
        return workspaces.filter((workspace) => workspace ? workspace.get_monitor().get_model() === monitor.get_model() : false);
    })

    const threeFirst = createComputed([monitorWorkspaces], (workspaces) => { return { first: workspaces[0], second: workspaces[1], third: workspaces[2] } });
    const theRest = createComputed([monitorWorkspaces], (workspaces) => { return workspaces.slice(3) });

    return (
        <box cssClasses={["Workspaces"]}>
            <MainWorkspace workspace={threeFirst.as(({ first }) => first)} />
            <MainWorkspace workspace={threeFirst.as(({ second }) => second)} />
            <MainWorkspace workspace={threeFirst.as(({ third }) => third)} />
            <MoreWorkspacesButton theRest={theRest} />
        </box>
    );
}
