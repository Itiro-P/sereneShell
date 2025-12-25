import { Astal, Gtk } from "ags/gtk4";
import { Accessor, createState, onCleanup, Setter } from "ags";
import { SystemMonitor } from "./SystemMonitor";
import { Media } from "./Media";
import { settingsService, mprisService, systemMonitorService } from "../services";
import { AudioControl } from "./AudioControl";
import Adw from "gi://Adw?version=1";
import Gdk from "gi://Gdk?version=4.0";
import { Popup } from "../generics";
import { WallpaperSwitcher } from "./WallpaperSwitcher";

export namespace ControlMenu {
    export function ControlMenu(gdkmonitor: Gdk.Monitor, [openGetter, openSetter]: [Accessor<boolean>, Setter<boolean>]) {
        const [rightStackvisibleChild, setRightStackvisibleChild] = createState<"statsView" | "optionsView">("statsView");
        const [leftStackvisibleChild, setLeftStackvisibleChild] = createState<"calendarView" | "mediaPlayerView">("calendarView");

        return (
            <Popup
                name={'ControlMenu ' + gdkmonitor.get_connector()}
                namespace='ControlMenu'
                layer={Astal.Layer.OVERLAY}
                anchor={Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP}
                gdkmonitor={gdkmonitor}
                openGetter={openGetter}
                openSetter={openSetter}
                $={self => onCleanup(() => self.destroy())}
                onHide={() => {setRightStackvisibleChild("statsView"), setLeftStackvisibleChild("calendarView")}}
                transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
            >
                <box cssClasses={["ControlMenu"]} orientation={Gtk.Orientation.VERTICAL}>
                    <box cssClasses={["StackSwitcher"]} homogeneous>
                        <label cssClasses={["Title"]} label={'Control Menu'} />
                        <box homogeneous>
                            <button
                                cssClasses={rightStackvisibleChild(vc => ["PageSwitcher", vc === "statsView" ? "Active" : "Inactive"])}
                                halign={Gtk.Align.CENTER}
                                onClicked={() => { if (rightStackvisibleChild.peek() !== "statsView") setRightStackvisibleChild("statsView") }}
                            >
                                <box>
                                    <image iconName={"application-x-executable"} />
                                    <label label={"Stats"} />
                                </box>
                            </button>
                            <button
                                cssClasses={rightStackvisibleChild(vc => ["PageSwitcher", vc === "optionsView" ? "Active" : "Inactive"])}
                                halign={Gtk.Align.CENTER}
                                onClicked={() => { if (rightStackvisibleChild.peek() !== "optionsView") setRightStackvisibleChild("optionsView") }}
                            >
                                <box>
                                    <image iconName={"application-x-executable"} />
                                    <label label={"Options"} />
                                </box>
                            </button>
                        </box>
                    </box>
                    <box>
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <box cssClasses={["StackSwitcher"]} homogeneous>
                                <button
                                    cssClasses={leftStackvisibleChild(vc => ["PageSwitcher", vc === "calendarView" ? "Active" : "Inactive"])}
                                    halign={Gtk.Align.CENTER}
                                    onClicked={() => { if (leftStackvisibleChild.peek() !== "calendarView") setLeftStackvisibleChild("calendarView") }}
                                >
                                    <box>
                                        <image iconName={"application-x-executable"} />
                                        <label label={"Calendar"} />
                                    </box>
                                </button>
                                <button
                                    cssClasses={leftStackvisibleChild(vc => ["PageSwitcher", vc === "mediaPlayerView" ? "Active" : "Inactive"])}
                                    halign={Gtk.Align.CENTER}
                                    sensitive={mprisService.players(ps => ps.length > 0)}
                                    onClicked={() => { if (leftStackvisibleChild.peek() !== "mediaPlayerView") setLeftStackvisibleChild("mediaPlayerView") }}
                                >
                                    <box>
                                        <image iconName={"application-x-executable"} />
                                        <label label={"Media Player"} />
                                    </box>
                                </button>
                            </box>
                            <stack
                                visibleChildName={leftStackvisibleChild}
                                transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                                interpolateSize
                                transitionDuration={250}
                            >
                                <box $type={"named"} name={"calendarView"} halign={Gtk.Align.CENTER}>
                                    <Gtk.Calendar cssClasses={["Calendar"]} />
                                </box>
                                <box $type={"named"} name={"mediaPlayerView"}>
                                    <Media.Media />
                                </box>
                            </stack>
                        </box>
                        <stack
                            visibleChildName={rightStackvisibleChild}
                            transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                            transitionDuration={250}
                        >
                            <box $type={"named"} name={"statsView"}>
                                <box orientation={Gtk.Orientation.VERTICAL}>
                                    <Adw.PreferencesGroup title={"Main Page"}>
                                        <Gtk.ListBox selectionMode={Gtk.SelectionMode.NONE} cssClasses={[".boxed-list"]}>
                                            <SystemMonitor.SystemMonitor />
                                            <AudioControl.Mixer />
                                        </Gtk.ListBox>
                                    </Adw.PreferencesGroup>
                                </box>
                            </box>
                            <box $type={"named"} name={"optionsView"} orientation={Gtk.Orientation.VERTICAL}>
                                <Adw.PreferencesGroup title={"Animations and Components"}>
                                    <Gtk.ListBox selectionMode={Gtk.SelectionMode.NONE} cssClasses={[".boxed-list"]}>
                                        <Adw.SwitchRow
                                            cssClasses={["ToggleAnimations", "Option"]}
                                            title={"Animations"}
                                            active={settingsService.animationsEnabled}
                                            onNotifyActive={self => settingsService.setAnimationsEnabled = self.get_active()}
                                        />
                                        <Adw.SwitchRow
                                            cssClasses={["ToggleCava", "Option"]}
                                            title={"Cava"}
                                            active={settingsService.cavaVisible}
                                            onNotifyActive={self => settingsService.setCavaVisible = self.get_active()}
                                        />
                                    </Gtk.ListBox>
                                </Adw.PreferencesGroup>
                            </box>
                        </stack>
                    </box>
                    <WallpaperSwitcher.WallpaperSwitcher gdkmonitor={gdkmonitor.get_connector()!} />
                </box>
            </Popup>
        );
    }

    export function ControlMenuButton({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
        const [open, setOpen] = createState(false);
        const controlMenuPopup = ControlMenu(gdkmonitor, [open, setOpen]) as Astal.Window;
        return (
            <button
                cssClasses={systemMonitorService.batteryCritical(bc => ["ControlMenuButton", bc ? "ControlMenuButtonCritical" : "ControlMenuButtonNormal"])}
                label={"󰣇"}
                onClicked={() => setOpen(!open())}
            />
        );
    }
}
