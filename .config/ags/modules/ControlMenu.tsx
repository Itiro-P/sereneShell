import { Gtk } from "ags/gtk4";
import { Accessor, createState } from "ags";
import systemMonitor from "./SystemMonitor";
import settingsService from "../services/Settings";
import audioControl from "./AudioControl";
import wallpaperSwitcher from "./WallpaperSwitcher";
import Adw from "gi://Adw?version=1";

class ControlMenuClass {

    public constructor() { }

    public ControlPopover(connector: string) {
        const [visibleChild, setVisibleChild] = createState<"statsView" | "optionsView" | "wallpapersView">("statsView");
        return (
            <popover onHide={() => setVisibleChild("statsView")}>
                <box cssClasses={["ControlMenu"]} orientation={Gtk.Orientation.VERTICAL}>
                    <box cssClasses={["StackSwitcher"]} homogeneous>
                        <label cssClasses={["Title"]} label={'Control Menu'} />
                        <box homogeneous>
                            <button
                                cssClasses={visibleChild(vc => ["PageSwitcher", vc === "statsView" ? "Active" : "Inactive"])}
                                halign={Gtk.Align.CENTER}
                                onClicked={() => { if (visibleChild.peek() !== "statsView") setVisibleChild("statsView") }}
                            >
                                <box>
                                    <image iconName={"application-x-executable"} />
                                    <label label={"Stats"} />
                                </box>
                            </button>
                            <button
                                cssClasses={visibleChild(vc => ["PageSwitcher", vc === "optionsView" ? "Active" : "Inactive"])}
                                halign={Gtk.Align.CENTER}
                                onClicked={() => { if (visibleChild.peek() !== "optionsView") setVisibleChild("optionsView") }}
                            >
                                <box>
                                    <image iconName={"application-x-executable"} />
                                    <label label={"Options"} />
                                </box>
                            </button>
                        </box>
                    </box>
                    <box>
                        <Gtk.Calendar cssClasses={["Calendar"]} />
                        <stack
                            visibleChildName={visibleChild}
                            transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                            transitionDuration={250}
                        >
                            <box $type={"named"} name={"statsView"}>
                                <box orientation={Gtk.Orientation.VERTICAL}>
                                    <Adw.PreferencesGroup title={"Main Page"}>
                                        <Gtk.ListBox selectionMode={Gtk.SelectionMode.NONE} cssClasses={[".boxed-list"]}>
                                            {systemMonitor.SystemMonitor}
                                            {audioControl.Mixer}
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
                                        <Adw.SwitchRow
                                            cssClasses={["FocusMode", "Option"]}
                                            title={"Focus Mode"}
                                            active={settingsService.cavaVisible}
                                            onNotifyActive={self => settingsService.setCavaVisible = self.get_active()}
                                        />
                                    </Gtk.ListBox>
                                </Adw.PreferencesGroup>
                            </box>
                        </stack>
                    </box>
                    {wallpaperSwitcher.WallpaperSwitcher(connector)}
                </box>
            </popover>
        );
    }

    public ControlMenuButton(connector: string) {
        return (
            <menubutton
                cssClasses={systemMonitor.BatteryCritical(bc => ["ControlMenuButton", bc ? "ControlMenuButtonCritical" : "ControlMenuButtonNormal"])}
                popover={this.ControlPopover(connector) as Gtk.Popover}
            >
                <label label="󰣇" />
            </menubutton>
        );
    }
}

const controlMenu = new ControlMenuClass();

export default controlMenu;
