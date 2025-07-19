import { Variable, bind } from "astal"
import { Gtk } from "astal/gtk4";
import { hasAnyClient } from "../services/Hyprland";

type ClockDate = {
    clock: string;
    date: string;
}

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function formatDateTime(): ClockDate {
    const now = new Date();
    const clock = timeFormatter.format(now);
    let date = dateFormatter.format(now);
    date = date[0].toUpperCase() + date.slice(1);

    return { clock, date };
}

function calculateNextMinute(): number {
  const now = new Date();
  const secondsToNextMinute = 60 - now.getSeconds();
  return secondsToNextMinute * 1000;
}

const clock = Variable<ClockDate>(formatDateTime());

function startOptimizedClock() {
    const update = () => {
        clock.set(formatDateTime());
        setTimeout(update, calculateNextMinute());
    };

    setTimeout(update, calculateNextMinute());
}

startOptimizedClock();

export function MiniTime() {
    return (
        <label
            cssClasses={["Time"]}
            label={bind(clock).as(t => t.clock)}
            tooltipMarkup={bind(clock).as(t => t.date)}
            visible={bind(hasAnyClient).as(hac => !hac)}
        />
    );
}

export function DateTime() {
    return (
        <box cssClasses={["DateTime"]} orientation={Gtk.Orientation.VERTICAL}>
            <label cssClasses={["Time"]} label={bind(clock).as(t => t.clock)} />
            <label cssClasses={["Date"]} label={bind(clock).as(t => t.date)} />
        </box>
    );
}
