import { onCleanup } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app";

function Entry({ bind, action }: { bind: string, action: string }) {
    return (
        <box cssClasses={['Entry']} overflow={Gtk.Overflow.HIDDEN} homogeneous>
            <label cssClasses={["Bind"]} label={bind} />
            <label cssClasses={["Action"]} label={action} />
        </box>
    );
}

export default function Cheatsheet({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {

    return (
        <window
            name='Cheatsheet'
            layer={Astal.Layer.OVERLAY}
            gdkmonitor={gdkmonitor}
            keymode={Astal.Keymode.ON_DEMAND}
            application={app}
            $={(self) => onCleanup(() => self.destroy())}
        >
            <Gtk.EventControllerKey onKeyPressed={({ widget }, keyval: number) => {
                switch(keyval) {
                    case Gdk.KEY_Escape:
                        widget.hide();
                        break;
                    default:

                }}}
            />
            <box cssClasses={['Cheatsheet']} orientation={Gtk.Orientation.VERTICAL}>
                <label cssClasses={['Title']} label={'Cheatsheet'} />
                <box cssClasses={['Half']} homogeneous>
                    <box cssClasses={['Section']} orientation={Gtk.Orientation.VERTICAL}>
                        <label cssClasses={["Subtitle"]} label={"Clients Workflow"} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <Entry bind="SUPER + P" action="Pin client" />
                            <Entry bind="SUPER + Q" action="Close client" />
                            <Entry bind="SUPER + V" action="Toggle floating" />
                            <Entry bind="SUPER + F" action="Toggle fullscreen" />
                            <Entry bind="SUPER + J" action="Toggle Dwindle" />
                            <Entry bind="SUPER + " action="Move focus to the client at above" />
                            <Entry bind="SUPER + " action="Move focus to the client at below" />
                            <Entry bind="SUPER + " action="Move focus to the clienFixar clientet at left" />
                            <Entry bind="SUPER + " action="Move focus to the client at right" />
                        </box>
                    </box>
                    <box cssClasses={['Section']} orientation={Gtk.Orientation.VERTICAL}>
                        <label cssClasses={["Subtitle"]} label={"Workspaces Workflow"} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <Entry bind="CTRL + SUPER + " action="Go to workspace at the left" />
                            <Entry bind="CTRL + SUPER + " action="Go to workspace at the right" />
                            <Entry bind="CTRL + SHIFT + SUPER + " action="Move to workspace at the left side" />
                            <Entry bind="CTRL + SHIFT + SUPER + " action="Move to workspace at the right side" />
                            <Entry bind="SUPER + S" action="Go to special workspace" />
                            <Entry bind="SUPER + SHIFT + S" action="Move to special workspace" />
                        </box>
                    </box>
                </box>
                <box cssClasses={['Half']} homogeneous>
                    <box cssClasses={['Section']} orientation={Gtk.Orientation.VERTICAL}>
                        <label cssClasses={["Subtitle"]} label={"Default Programs"} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <Entry bind="SUPER + Enter" action="Terminal" />
                            <Entry bind="SUPER + R" action="Launcher" />
                            <Entry bind="SUPER + E" action="Open File Manager" />
                            <Entry bind="SUPER + D" action="Toggle Dock" />
                            <Entry bind="SUPER + C" action="Toggle Cheatsheet" />
                            <Entry bind="SUPER + ESC" action="Toggle Wlogout" />
                        </box>
                    </box>
                    <box cssClasses={['Section']} orientation={Gtk.Orientation.VERTICAL}>
                        <label cssClasses={["Subtitle"]} label={"Others"} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <Entry bind="PRINT" action="Screenshot output" />
                            <Entry bind="SUPER + PRINT" action="Screenshot region" />
                            <Entry bind="SUPER + M" action="Logout" />
                            <Entry bind="SUPER + L" action="Lock Screen" />
                        </box>
                    </box>
                </box>
            </box>
        </window>
    );
}
