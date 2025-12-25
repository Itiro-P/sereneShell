import { dateTimeService } from "../services";

export namespace DateTime {
    export function Clock() {
        return (
            <label
                cssClasses={["Time"]}
                label={dateTimeService.state(t => " " + t.time)}
                tooltipMarkup={dateTimeService.state(d => "󰃭 " + d.date)}
            />
        );
    }
}
