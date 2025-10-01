import { Gdk, Gtk } from "ags/gtk4";
import { Astal } from "ags/gtk4";
import { createState, onCleanup } from "ags";
import app from "ags/gtk4/app";
import systemMonitor from "./SystemMonitor";
import settingsService from "../services/Settings";
import audioControl from "./AudioControl";

class ControlMenuClass {

    public constructor() {}

    public ControlMenu(gdkmonitor: Gdk.Monitor) {
        const [visibleChild, setVisibleChild] = createState<"statsView" | "optionsView">("statsView");
        return (
            <window
                name={'ControlMenu ' + gdkmonitor.get_connector()}
                namespace='ControlMenu'
                layer={Astal.Layer.OVERLAY}
                anchor={ Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.TOP }
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
                            <box cssClasses={visibleChild(vc => ["PageSwitcher", vc === "statsView" ? "Active": "Inactive"])} halign={Gtk.Align.CENTER}>
                                <Gtk.GestureClick button={Gdk.BUTTON_PRIMARY} onPressed={() => { if(visibleChild.get() !== "statsView") setVisibleChild("statsView") }} />
                                <image iconName={"application-x-executable"} />
                                <label label={"Stats"} />
                            </box>
                            <box cssClasses={visibleChild(vc => ["PageSwitcher", vc === "optionsView" ? "Active": "Inactive"])} halign={Gtk.Align.CENTER}>
                                <Gtk.GestureClick button={Gdk.BUTTON_PRIMARY} onPressed={() => { if(visibleChild.get() !== "optionsView") setVisibleChild("optionsView") }} />
                                <image iconName={"application-x-executable"} />
                                <label label={"Options"} />
                            </box>
                        </box>
                    </box>
                    <stack
                        visibleChildName={visibleChild}
                        transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                        transitionDuration={250}
                    >
                        <box $type={"named"} name={"statsView"}>
                            <Gtk.Calendar cssClasses={["Calendar"]} />
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
                            <button
                                cssClasses={["Option"]}
                                label={'Wallpapers'}
                                halign={Gtk.Align.START}
                                onClicked={
                                () => {
                                    app.toggle_window(`WallpaperSwitcher ${gdkmonitor.get_connector()}`);
                                    app.toggle_window(`ControlMenu ${gdkmonitor.get_connector()}`);
                                }}
                            />
                        </box>
                    </stack>
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
