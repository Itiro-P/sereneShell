import GLib from "gi://GLib?version=2.0";
import { Accessor, createState, Setter } from "ags";

class DateTimeClass {
    private formatterTime = "%H:%M";
    private formatterDate = "%A, %x";
    private state: Accessor<{ date: string, time: string}>;
    private setState: Setter<{ date: string, time: string }>;

    constructor() {
        [this.state, this.setState] = createState({ date: "", time: "" });
        this.update();
        this.scheduleNextTick();
    }

    private update() {
        const now = GLib.DateTime.new_now_local();
        this.setState({
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

    public DateTime = () => {
        return (
            <label
                cssClasses={["Time"]}
                label={this.state(t => " " + t.time)}
                tooltipMarkup={this.state(d => "󰃭 " + d.date)}
            />
        );
    }
}

const dateTime = new DateTimeClass();

export default dateTime;
