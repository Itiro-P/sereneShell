import { Gtk } from "ags/gtk4";
import { hasAnyClient } from "../services/Hyprland";
import { createComputed, createState } from "ags";

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

const [clock, setClock] = createState(formatDateTime());

function startClock() {
    const update = () => {
        setClock(formatDateTime());
        setTimeout(update, calculateNextMinute());
    };

    setTimeout(update, calculateNextMinute());
}

startClock();

const time = clock.as(c => c.clock);
const date = clock.as(c => c.date);

export const [isDTCvisible, setIsDTCvisible] = createState(true);

const isMiniTimeVisible = createComputed([isDTCvisible, hasAnyClient], (idv, hac) => !hac || !idv);

export function MiniTime() {
    return (
        <label cssClasses={["Time"]} label={time} tooltipMarkup={date} visible={isMiniTimeVisible} />
    );
}

export function DateTimeCalendar() {
    return (
        <box cssClasses={["DateTimeCalendar"]} visible={isDTCvisible}>
            <Gtk.Calendar cssClasses={["Calendar"]} />
            <box cssClasses={["DateTime"]} orientation={Gtk.Orientation.VERTICAL}>
                <label cssClasses={["Time"]} label={time} />
                <label cssClasses={["Date"]} label={date} />
            </box>
        </box>
    );
}
