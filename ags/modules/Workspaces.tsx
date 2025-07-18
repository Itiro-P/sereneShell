import { bind, Variable } from "astal";
import { Gtk, Gdk } from "astal/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

interface WorkspaceProps {
    workspace: AstalHyprland.Workspace;
    isInPopover?: boolean;
}

interface MainWorkspaceProps {
    workspace: Variable<AstalHyprland.Workspace | null>;
}

interface WorkspacesProps {
    monitor: Gdk.Monitor;
}

const hyprland = AstalHyprland.get_default();
const focusedWorkspace = bind(hyprland, "focusedWorkspace");

function getMonitorName(monitor: Gdk.Monitor): string {
    const connector = monitor.get_connector();
    if (connector) return connector;

    const manufacturer = monitor.get_manufacturer() || "unknown";
    const model = monitor.get_model() || "unknown";
    const geometry = monitor.get_geometry();

    return `${manufacturer}_${model}_${geometry.x}x${geometry.y}`;
}

function createWorkspaceData(monitor: Gdk.Monitor) {
    const monitorName = getMonitorName(monitor);

    return Variable.derive([bind(hyprland, "workspaces")], (workspaces) => {
        const filtered = workspaces.filter(ws => { return ws.get_monitor().get_name() === monitorName });

        const sorted = filtered.sort((a, b) => a.id - b.id);
        return {
            first: sorted[0] || null,
            second: sorted[1] || null,
            third: sorted[2] || null,
            rest: sorted.slice(3)
        };
    });
}

const clickHandlers = new WeakMap<Gtk.Widget, Gtk.GestureClick>();

function setupWorkspaceClick(widget: Gtk.Widget, workspaceId: number) {
    if (!clickHandlers.has(widget)) {
        const click = new Gtk.GestureClick();
        click.connect("pressed", () => {
            if(focusedWorkspace.get().id !== workspaceId)
                hyprland.dispatch("workspace", `${workspaceId}`);
        });
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
            widthChars={1}
            maxWidthChars={1}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
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
                    if (ws && ws.id !== focusedWorkspace.get().id)
                        hyprland.dispatch("workspace", `${ws.id}`);
                });
                self.add_controller(click);
            }}
            cssClasses={bind(Variable.derive([focusedWorkspace, workspace], (focused, ws) => {
                if (!ws) return ["Workspace", "Inactive"];
                return ["Workspace", ws.id === focused.id ? "Active" : "Inactive"];
            }))}
            label={bind(workspace).as(w => `${w?.id ?? ' '}`)}
            widthChars={1}
            maxWidthChars={1}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
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

function WorkspacePopover({ workspaceData }: { workspaceData: Variable<any> }) {
    return (
        <popover
            cssClasses={["WorkspacePopover"]}
            child={
                <box vertical cssClasses={["WorkspacePopoverContent"]}>
                    {bind(workspaceData).as(({rest}) => {
                        const rows = chunkArray(rest, 4);
                        return rows.map((rowWorkspaces, index) => (
                            <box cssClasses={["WorkspaceRow"]} spacing={4}>
                                {rowWorkspaces.map(workspace => (
                                    <Workspace workspace={workspace} isInPopover={true}/>
                                ))}
                            </box>
                        ));
                    })}
                </box>
            }
        />
    );
}

function MoreWorkspacesButton({ workspaceData }: { workspaceData: Variable<any> }) {
    return (
        <menubutton
            cssClasses={["MoreWorkspacesButton"]}
            sensitive={bind(workspaceData).as(({ rest }) => rest.length > 0)}
            child={<label label={'+'} />}
            popover={<WorkspacePopover workspaceData={workspaceData} /> as Gtk.Popover}
        />
    );
}

export default function Workspaces({ monitor }: WorkspacesProps) {
    const workspaceData = createWorkspaceData(monitor);

    return (
        <box cssClasses={["Workspaces"]} onDestroy={() => workspaceData.drop()}>
            <MainWorkspace workspace={Variable.derive([workspaceData], (data) => data.first)} />
            <MainWorkspace workspace={Variable.derive([workspaceData], (data) => data.second)} />
            <MainWorkspace workspace={Variable.derive([workspaceData], (data) => data.third)} />
            <MoreWorkspacesButton workspaceData={workspaceData} />
        </box>
    );
}
