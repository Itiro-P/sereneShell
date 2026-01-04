import { Accessor } from "ags";
import { systemMonitorService } from "../services";

export namespace SystemMonitor {
    function Cpu() {
        return (
            <box cssClasses={["Cpu"]}>
                <label cssClasses={['Icon']} label={''} />
                <label cssClasses={['PercentageLabel']} label={systemMonitorService.metrics(m => `${m.cpu}%`)} widthChars={4} />
            </box>
        );
    }

    function Memory() {
        return (
            <box cssClasses={["Memory"]}>
                <label cssClasses={['Icon']} label={'󰘚'} />
                <label cssClasses={['PercentageLabel']} label={systemMonitorService.metrics(m => `${m.mem}%`)} widthChars={4} />
            </box>
        );
    }

    export function SystemMonitor() {
        return (
            <box cssClasses={["SystemMonitor"]}>
                <Cpu />
                <Memory />
            </box>
        );
    }
}
