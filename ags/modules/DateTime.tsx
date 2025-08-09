import { Gtk } from "ags/gtk4";
import hyprlandService from "../services/Hyprland";
import { Accessor, createBinding, createComputed, createState, Setter } from "ags";
import GLib from "gi://GLib?version=2.0";
import { createPoll } from "ags/time";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

class DateTimeClass {
    private formatterTime = "%H:%M";
    private formatterDate = "Hoje é: %A, %d de %B de %Y";
    private _dateTime: Accessor<{ date: string, time: string }>;
    private _isDTCvisible: Accessor<boolean>;
    private _setIsDTCvisible: Setter<boolean>;


    public constructor() {
        [this._isDTCvisible, this._setIsDTCvisible] = createState(true);

        this._dateTime = createPoll({ date: "", time: "" }, 60000, () => {
            const now = GLib.DateTime.new_now_local();
            return {
                date: now.format(this.formatterDate)!,
                time: now.format(this.formatterTime)!
            };
        });
    }

    public get isDTCvisible() {
        return this._isDTCvisible;
    }

    public shouldDTCAppear(monitor: AstalHyprland.Monitor) {
        return createComputed(
            [this._isDTCvisible, createBinding(monitor, 'activeWorkspace'), hyprlandService.clients],
            (dv, aw, cs) => cs.findIndex(it => it.get_workspace() === aw) === -1 && dv
        );
    }

    public toggleIsDTCvisible() {
        this._setIsDTCvisible(!this._isDTCvisible.get());
    }

    public get Time() {
        return (
            <label cssClasses={["Time"]} label={this._dateTime.as(t => ` ${t.time}`)} tooltipMarkup={this._dateTime.as(d => `󰃭 ${d.date}`)} />
        );
    }

    public get DateTimeCalendar() {
        return (
            <box cssClasses={["DateTimeCalendar"]}>
                <Gtk.Calendar cssClasses={["Calendar"]} />
                <box cssClasses={["DateTime"]} orientation={Gtk.Orientation.VERTICAL}>
                    <label cssClasses={["Time"]} label={this._dateTime.as(t => t.time)} />
                    <label cssClasses={["Date"]} label={this._dateTime.as(d => d.date)} />
                </box>
            </box>
        );
    }
}

const dateTime = new DateTimeClass;

export default dateTime;
