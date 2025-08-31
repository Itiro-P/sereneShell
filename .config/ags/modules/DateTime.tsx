import { Gtk } from "ags/gtk4";
import { Accessor } from "ags";
import GLib from "gi://GLib?version=2.0";
import { createPoll } from "ags/time";

const pollTime = 60000;

class DateTimeClass {
    private formatterTime = "%H:%M";
    private formatterDate = "Hoje é: %A, %d de %B de %Y";
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

    private get DateTimePopover() {
        return (
            <Gtk.Popover>
                <Gtk.Calendar cssClasses={["Calendar"]} />
            </Gtk.Popover>
        );
    }

    public get DateTime() {
        return (
            <menubutton cssClasses={["DateTimeCalendar"]} popover={this.DateTimePopover as Gtk.Popover}>
                <label cssClasses={["Time"]} label={this._dateTime.as(t => ` ${t.time}`)} tooltipMarkup={this._dateTime.as(d => `󰃭 ${d.date}`)} />
            </menubutton>
        );
    }
}

const dateTime = new DateTimeClass;

export default dateTime;
