import { Gdk, Gtk } from "ags/gtk4";
import { Astal } from "ags/gtk4";
import { Accessor, createState, onCleanup } from "ags";
import app from "ags/gtk4/app";
import systemMonitor from "./SystemMonitor";
import settingsService from "../services/Settings";
import audioControl from "./AudioControl";
import wallpaperSwitcher from "./WallpaperSwitcher";

class ControlMenuClass {

    public constructor() {}

    public ControlMenu(gdkmonitor: Gdk.Monitor) {
        const [visibleChild, setVisibleChild] = createState<"statsView" | "optionsView" | "wallpapersView">("statsView");
        return (
            <window
                name={'ControlMenu ' + gdkmonitor.get_connector()}
                namespace='ControlMenu'
                layer={Astal.Layer.OVERLAY}
                anchor={Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP}
                gdkmonitor={gdkmonitor}
                keymode={Astal.Keymode.ON_DEMAND}
                application={app}
                $={self => onCleanup(() => self.destroy())}
                onHide={() => setVisibleChild("statsView")}
            >
                <Gtk.EventControllerKey onKeyPressed={({ widget }, keyval: number) => {
                    switch(keyval) {
                        case Gdk.KEY_Escape:
                            widget.hide();
                            break;
                        default:
                    }}}
                />
                <box cssClasses={["ControlMenu"]} orientation={Gtk.Orientation.VERTICAL}>
                    <box cssClasses={["StackSwitcher"]} homogeneous>
                        <label cssClasses={["Title"]} label={'Control Menu'} />
                        <box homogeneous>
                            <button
                                cssClasses={visibleChild(vc => ["PageSwitcher", vc === "statsView" ? "Active": "Inactive"])}
                                halign={Gtk.Align.CENTER}
                                onClicked={() => { if(visibleChild.peek() !== "statsView") setVisibleChild("statsView") }}
                            >
                                <box>
                                    <image iconName={"application-x-executable"} />
                                    <label label={"Stats"} />
                                </box>
                            </button>
                            <button
                                cssClasses={visibleChild(vc => ["PageSwitcher", vc === "optionsView" ? "Active": "Inactive"])}
                                halign={Gtk.Align.CENTER}
                                onClicked={() => { if(visibleChild.peek() !== "optionsView") setVisibleChild("optionsView") }}
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
                                    {systemMonitor.SystemMonitor}
                                    {audioControl.Mixer}
                                </box>
                            </box>
                            <box $type={"named"} name={"optionsView"} orientation={Gtk.Orientation.VERTICAL}>
                                <label cssClasses={["Subtitle"]} label={"Animations & Components"} />
                                <box cssClasses={["ToggleAnimations", "Option"]}>
                                    <label label={"Animations "} halign={Gtk.Align.START} />
                                    <switch
                                        active={settingsService.animationsEnabled}
                                        onStateSet={(src, val) => settingsService.setAnimationsEnabled = val}
                                    />
                                </box>
                                <box cssClasses={["ToggleCava", "Option"]}>
                                    <label label={"Cava "} halign={Gtk.Align.START} />
                                    <switch
                                        active={settingsService.cavaVisible}
                                        onStateSet={(src, val) => settingsService.setCavaVisible = val}
                                    />
                                </box>
                                <box cssClasses={["FocusMode", "Option"]}>
                                    <label label={"Focus Mode "} halign={Gtk.Align.START} />
                                    <switch
                                        active={settingsService.cavaVisible}
                                        onStateSet={(src, val) => settingsService.setCavaVisible = val}
                                    />
                                </box>
                            </box>
                        </stack>
                    </box>
                    {wallpaperSwitcher.WallpaperSwitcher(gdkmonitor.get_connector()!)}
                </box>
            </window>
        );
    }

    public ControlMenuButton(connector: string) {
        return (
            <button cssClasses={systemMonitor.BatteryCritical(bc => ["ControlMenuButton", bc ? "ControlMenuButtonCritical" : "ControlMenuButtonNormal"])} label={"󰣇"} onClicked={() => app.toggle_window(`ControlMenu ${connector}`)} />
        );
    }
}

const controlMenu = new ControlMenuClass();

export default controlMenu;
