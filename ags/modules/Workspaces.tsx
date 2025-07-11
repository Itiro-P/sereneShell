import { bind, Variable } from "astal";
import { Gtk } from "astal/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

interface WorkspaceProps {
    workspace: AstalHyprland.Workspace;
    isInPopover?: boolean;
}

interface MainWorkspaceProps {
    workspace: Variable<AstalHyprland.Workspace | null>;
}

const hyprland = AstalHyprland.get_default();
const focusedWorkspace = bind(hyprland, "focusedWorkspace");

const workspaceData = Variable.derive([bind(hyprland, "workspaces")], (workspaces) => {
    const sorted = workspaces.sort((a, b) => a.id - b.id);
    return {
        first: sorted[0] || null,
        second: sorted[1] || null,
        third: sorted[2] || null,
        rest: sorted.slice(3)
    };
});

const clickHandlers = new WeakMap<Gtk.Widget, Gtk.GestureClick>();

function setupWorkspaceClick(widget: Gtk.Widget, workspaceId: number) {
    if (!clickHandlers.has(widget)) {
        const click = new Gtk.GestureClick();
        click.connect("pressed", () => {if(focusedWorkspace.get().id !== workspaceId) hyprland.dispatch("workspace", `${workspaceId}`)});
        widget.add_controller(click);
        clickHandlers.set(widget, click);
    }
}

function Workspace({ workspace, isInPopover = false }: WorkspaceProps) {
    const baseClasses = isInPopover ? ["Workspace", "WorkspacePopoverItem"] : ["Workspace"];

    return (
        <label
            setup={(self) => setupWorkspaceClick(self, workspace.id)}
            cssClasses={focusedWorkspace.as(focused => [...baseClasses, workspace.id === focused.id ? "Active" : "Inactive"])}
            label={`${workspace.id}`}
        />
    );
}

function MainWorkspace({ workspace }: MainWorkspaceProps) {
    return (
        <label
            setup={(self) => {
                const click = new Gtk.GestureClick();
                click.connect("pressed", () => {
                    const ws = workspace.get();
                    if (ws && ws.id !== focusedWorkspace.get().id) hyprland.dispatch("workspace", `${ws.id}`);
                });
                self.add_controller(click);
            }}
            cssClasses={bind(Variable.derive([focusedWorkspace, workspace], (focused, ws) => {
                if (!ws) return ["Workspace", "Inactive"];
                return ["Workspace", ws.id === focused.id ? "Active" : "Inactive"];
            }))}
            label={bind(workspace).as(w => `${w?.id ?? ' '}`)}
        />
    );
}

const chunkArray = (array: AstalHyprland.Workspace[], size: number): AstalHyprland.Workspace[][] => {
    const result: AstalHyprland.Workspace[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

function WorkspacePopover() {
    return (
        <popover
            cssClasses={["WorkspacePopover"]}
            child={
                <box vertical cssClasses={["WorkspacePopoverContent"]}>
                    {bind(workspaceData).as(({rest}) => {
                        const rows = chunkArray(rest, 4);
                        return rows.map((rowWorkspaces, index) => (
                            <box cssClasses={["WorkspaceRow"]} homogeneous spacing={4}>
                                {rowWorkspaces.map(workspace => (<Workspace workspace={workspace} isInPopover={true}/>))}
                            </box>
                        ));
                    })}
                </box>
            }
        />
    );
}

function MoreWorkspacesButton() {
    return (
        <menubutton
            cssClasses={["MoreWorkspacesButton"]}
            sensitive={bind(workspaceData).as(({ rest }) => rest.length > 0)}
            child={<label label={'+'} />}
            popover={WorkspacePopover() as Gtk.Popover}
        />
    );
}

export default function Workspaces() {
    return (
        <box cssClasses={["Workspaces"]} onDestroy={() => workspaceData.drop()}>
            <MainWorkspace workspace={Variable.derive([workspaceData], (data) => data.first)} />
            <MainWorkspace workspace={Variable.derive([workspaceData], (data) => data.second)} />
            <MainWorkspace workspace={Variable.derive([workspaceData], (data) => data.third)} />
            <MoreWorkspacesButton />
        </box>
    );
}
