import { Gtk } from "ags/gtk4";
import { hasAnyClient } from "../services/Hyprland";
import { Accessor, createComputed, createState } from "ags";
import GLib from "gi://GLib?version=2.0";
import { createPoll } from "ags/time";

class DateTimeManager {
    private static _instance: DateTimeManager;
    private formatterTime = "%H:%M";
    private formatterDate = "Hoje é: %A, %d de %B de %Y";
    private _time: Accessor<string>;
    private _date: Accessor<string>;

    private constructor() {
        this._date = createPoll("", 60000, () => GLib.DateTime.new_now_local().format(this.formatterDate)!);
        this._time = createPoll("", 60000, () => GLib.DateTime.new_now_local().format(this.formatterTime)!);
    }

    public static get instance() {
        if(!DateTimeManager._instance) {
            DateTimeManager._instance = new DateTimeManager;
        }
        return DateTimeManager._instance;
    }

    public get time() {
        return this._time;
    }

    public get date() {
        return this._date;
    }
}

export const [isDTCvisible, setIsDTCvisible] = createState(true);

const isMiniTimeVisible = createComputed([isDTCvisible, hasAnyClient], (idv, hac) => !hac || !idv);

export function MiniTime() {
    return (
        <label cssClasses={["Time"]} label={DateTimeManager.instance.time} tooltipMarkup={DateTimeManager.instance.date} visible={isMiniTimeVisible} />
    );
}

export function DateTimeCalendar() {
    return (
        <box cssClasses={["DateTimeCalendar"]} visible={isDTCvisible}>
            <Gtk.Calendar cssClasses={["Calendar"]} />
            <box cssClasses={["DateTime"]} orientation={Gtk.Orientation.VERTICAL}>
                <label cssClasses={["Time"]} label={DateTimeManager.instance.time} />
                <label cssClasses={["Date"]} label={DateTimeManager.instance.date} />
            </box>
        </box>
    );
}
