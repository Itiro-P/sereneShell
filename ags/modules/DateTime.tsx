import { Variable, bind } from "astal"
import { Gtk } from "astal/gtk4";

type ClockDate = {
    clock: string;
    date: string;
}

const time = Variable<ClockDate>({ clock: "", date: "" }).poll(60_000,
    () => {
        const dateConstructor = new Date();
        return {
            clock: dateConstructor.toLocaleTimeString("pt-br", { hour: "2-digit", minute: "2-digit" }),
            date: dateConstructor.toLocaleDateString("pt-br", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/^./, char => char.toUpperCase())
        };
    }
);

export function MiniTime() {
    return (
        <label
            cssClasses={["Time"]}
            label={bind(time).as(t => `${t.clock}`)}
        />
    );
}

export function DateTime() {
    return (
        <box cssClasses={["DateTime"]} orientation={Gtk.Orientation.VERTICAL}>
            <label cssClasses={["Time"]} label={bind(time).as(t => `${t.clock}`)} />
            <label cssClasses={["Date"]} label={bind(time).as(t => `${t.date}`)} />
        </box>
    );
}
