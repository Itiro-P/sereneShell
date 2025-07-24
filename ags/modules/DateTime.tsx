import { Gtk } from "ags/gtk4";
import Hyprland from "../services/Hyprland";
import { Accessor, createComputed, createState, Setter } from "ags";
import GLib from "gi://GLib?version=2.0";
import { createPoll } from "ags/time";

export default class DateTime {
    private static _instance: DateTime;
    private formatterTime = "%H:%M";
    private formatterDate = "Hoje é: %A, %d de %B de %Y";
    private _time: Accessor<string>;
    private _date: Accessor<string>;

    private _isDTCvisible: Accessor<boolean>;
    private _setIsDTCvisible: Setter<boolean>;
    private isMiniTimeVisible: Accessor<boolean>;


    private constructor() {
        [this._isDTCvisible, this._setIsDTCvisible] = createState(true);
        this.isMiniTimeVisible = createComputed([this._isDTCvisible, Hyprland.instance.hasAnyClient], (idv, hac) => !hac || !idv);

        this._date = createPoll("", 60000, () => GLib.DateTime.new_now_local().format(this.formatterDate)!);
        this._time = createPoll("", 60000, () => GLib.DateTime.new_now_local().format(this.formatterTime)!);
    }

    public get isDTCvisible() {
        return this._isDTCvisible;
    }

    public set setIsDTCvisible(value: boolean) {
        if(value !== this._isDTCvisible.get()) this._setIsDTCvisible(value);
    }

    public toggleIsDTCvisible() {
        this._setIsDTCvisible(!this._isDTCvisible.get());
    }

    public static get instance() {
        if(!DateTime._instance) {
            DateTime._instance = new DateTime;
        }
        return DateTime._instance;
    }

    public get Time() {
        return (
            <label cssClasses={["Time"]} label={this._time} tooltipMarkup={this._date} visible={this.isMiniTimeVisible} />
        );
    }

    public get DateTimeCalendar() {
        return (
            <box cssClasses={["DateTimeCalendar"]} visible={this._isDTCvisible}>
                <Gtk.Calendar cssClasses={["Calendar"]} />
                <box cssClasses={["DateTime"]} orientation={Gtk.Orientation.VERTICAL}>
                    <label cssClasses={["Time"]} label={this._time} />
                    <label cssClasses={["Date"]} label={this._date} />
                </box>
            </box>
        );
    }
}
