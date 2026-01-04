import GLib from "gi://GLib?version=2.0";
import { Accessor, createState, Setter } from "ags";

class DateTimeClass {
    private formatterTime = "%H:%M";
    private formatterDate = "%A, %x";
    private _state: Accessor<{ date: string, time: string}>;
    private _setState: Setter<{ date: string, time: string }>;

    constructor() {
        [this._state, this._setState] = createState({ date: "", time: "" });
        this.update();
        this.scheduleNextTick();
    }

    private update() {
        const now = GLib.DateTime.new_now_local();
        this._setState({
            date: now.format(this.formatterDate)!,
            time: now.format(this.formatterTime)!,
        });
    }

    private scheduleNextTick() {
        const now = GLib.DateTime.new_now_local();
        const seconds = now.get_second();
        const delay = 60 - seconds;

        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, delay, () => {
            this.update();
            this.scheduleNextTick();
            return GLib.SOURCE_REMOVE;
        });
    }

    public get state() {
        return this._state;
    }
}

export const dateTimeService = new DateTimeClass();
