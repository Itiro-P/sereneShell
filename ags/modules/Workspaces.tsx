import { Gtk, Gdk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Hyprland from "../services/Hyprland";
import { Accessor, createComputed, For, onCleanup } from "ags";

export default class Workspaces {
    private static _instance: Workspaces;

    private constructor() {

    }

    public static get instance() {
        if(!this._instance) {
            this._instance = new Workspaces;
        }
        return this._instance;
    }

    private Workspace({ workspace, isInPopover = false }: { workspace: AstalHyprland.Workspace, isInPopover: boolean }) {
        const baseClasses = isInPopover ? ["Workspace", "WorkspacePopoverItem"] : ["Workspace"];
        const click = new Gtk.GestureClick();
        const handler_id = click.connect("pressed", () => { if(Hyprland.instance.focusedWorkspace.get().get_id() !== workspace.get_id()) workspace.focus() });
        onCleanup(() => { if (handler_id) click.disconnect(handler_id) });

        return (
            <label
                $={self => self.add_controller(click)}
                cssClasses={Hyprland.instance.focusedWorkspace.as(focused => [...baseClasses, workspace.id === focused.id ? "Active" : "Inactive"])}
                label={`${workspace.id}`} widthChars={3} maxWidthChars={3} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
            />
        );
    }

    private MainWorkspace({ workspace }: { workspace: Accessor<AstalHyprland.Workspace> }) {
        const click = new Gtk.GestureClick();
        const handler = click.connect("pressed", () => {
            const ws = workspace.get();
            if (ws && ws.id !== Hyprland.instance.focusedWorkspace.get().id) ws.focus();
        });

        onCleanup(() => { if (click) click.disconnect(handler) });
        return (
            <label
                $={(self) => self.add_controller(click)}
                cssClasses={createComputed([Hyprland.instance.focusedWorkspace, workspace], (focused, ws) => ["Workspace", ws && ws.id === focused?.id ? "Active" : "Inactive"])}
                sensitive={workspace.as(w => w !== null)}
                label={workspace.as(w => `${w?.id ?? ' '}`)}
                widthChars={1}
                maxWidthChars={1}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            />
        );
    }

    private WorkspacePopover({ theRest }: { theRest: Accessor<AstalHyprland.Workspace[]> }) {
        return (
            <popover cssClasses={["WorkspacePopover"]}>
                <Gtk.FlowBox maxChildrenPerLine={4}>
                    <For each={theRest} children={item => this.Workspace({ workspace: item, isInPopover: true })} />
                </Gtk.FlowBox>
            </popover>
        );
    }

    private MoreWorkspacesButton({ theRest }: { theRest: Accessor<AstalHyprland.Workspace[]> }) {
        return (
            <menubutton cssClasses={["MoreWorkspacesButton"]} sensitive={theRest.as(tr => tr.length > 0)} popover={this.WorkspacePopover({ theRest: theRest }) as Gtk.Popover}>
                <label label={'󰕏'} />
            </menubutton>
        );
    }

    public Workspaces({ monitor }: { monitor: Gdk.Monitor }) {
        const monitorWorkspaces = Hyprland.instance.workspaces.as(ws => {
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
                {this.MainWorkspace({ workspace: monitorWorkspaces.as(({ first }) => first) })}
                {this.MainWorkspace({ workspace: monitorWorkspaces.as(({ second }) => second) })}
                {this.MainWorkspace({ workspace: monitorWorkspaces.as(({ third }) => third) })}
                {this.MoreWorkspacesButton({ theRest: monitorWorkspaces.as(({ theRest }) => theRest) })}
            </box>
        );
    }
}
