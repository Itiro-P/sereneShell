import { Accessor } from "ags";
import { Gtk } from "ags/gtk4";
import { systemMonitorService } from "../services";

export namespace SystemMonitor {
    function Cpu() {
        return (
            <box cssClasses={["Cpu"]}>
                <label cssClasses={['Icon']} label={''} />
                <slider cssClasses={["Slider"]} value={systemMonitorService.metrics(m => m.cpu)} step={1} min={0} max={100} sensitive={false} hexpand />
                <label cssClasses={['PercentageLabel']} label={systemMonitorService.metrics(m => `${m.cpu}%`)} widthChars={4} />
            </box>
        );
    }

    function Memory() {
        return (
            <box cssClasses={["Memory"]}>
                <label cssClasses={['Icon']} label={'󰘚'} />
                <slider cssClasses={["Slider"]} value={systemMonitorService.metrics(m => m.mem)} step={1} min={0} max={100} sensitive={false} hexpand />
                <label cssClasses={['PercentageLabel']} label={systemMonitorService.metrics(m => `${m.mem}%`)} widthChars={4} />
            </box>
        );
    }

    function Battery() {
        return (
            <box cssClasses={["Battery"]}>
                <image cssClasses={["Icon"]} iconName={systemMonitorService.batteryIcon} />
                <slider cssClasses={["Slider"]} value={systemMonitorService.batteryPercentage} step={0.1} min={0} max={1} sensitive={false} hexpand />
                <label cssClasses={["PercentageLabel"]} label={systemMonitorService.batteryPercentage(p => `${Math.round(Math.min(1, p) * 100) ?? 0}%`)} widthChars={4} />
            </box>
        );
    }

    export function SystemMonitor() {
        return (
            <box cssClasses={["SystemMonitor"]} orientation={Gtk.Orientation.VERTICAL}>
                <Cpu />
                <Memory />
                <Battery />
                <label cssClasses={["StatusLabel"]} visible={systemMonitorService.batteryPercentage(p => p < 1)} label={systemMonitorService.batteryLifeLabel} />
            </box>
        );
    }
}
