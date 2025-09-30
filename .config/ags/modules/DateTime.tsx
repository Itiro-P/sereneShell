import { Accessor } from "ags";
import GLib from "gi://GLib?version=2.0";
import { createPoll } from "ags/time";

const pollTime = 60000;

class DateTimeClass {
    private formatterTime = "%H:%M";
    private formatterDate = "Today is: %A, %d de %B de %Y";
    private _dateTime: Accessor<{ date: string, time: string }>;

    public constructor() {
        this._dateTime = createPoll({ date: "", time: "" }, pollTime, () => {
            const now = GLib.DateTime.new_now_local();
            return {
                date: now.format(this.formatterDate)!,
                time: now.format(this.formatterTime)!
            };
        });
    }

    public get DateTime() {
        return (
            <label cssClasses={["Time"]} label={this._dateTime(t => " " + t.time)} tooltipMarkup={this._dateTime(d => "󰃭 " + d.date)} />
        );
    }
}

const dateTime = new DateTimeClass;

export default dateTime;
