import { Variable, bind } from "astal"

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
            onDestroy={ () => time.drop() }
            label={bind(time).as(t => `${t.clock}`)}
        />
    );
}
