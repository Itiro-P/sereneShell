import AstalBattery from "gi://AstalBattery"
import GTop from "gi://GTop?version=2.0";
import { formatTimeVerbose } from "../services/TimeFormatter";
import { Accessor, createBinding, createComputed } from "ags";
import { createPoll } from "ags/time";
import { Gtk } from "ags/gtk4";

type Metrics = {
    cpu: number,
    mem: number
}

const pollTime = 3000;

class SystemMonitorClass {
    private battery: AstalBattery.Device;
    private batteryPercentage: Accessor<number>;
    private batteryCharging: Accessor<boolean>;
    private batteryCritical: Accessor<boolean>;
    private batteryLifeLabel: Accessor<string>;
    private batteryIcon: Accessor<string>;

    private cpuSource: GTop.glibtop_cpu;
    private cpuData: { prev: { user: number, sys: number, total: number }, diff: { user: number, sys: number, total: number } };
    private memSource: GTop.glibtop_mem;
    private _metrics: Accessor<Metrics>;

    public constructor() {
        this.battery = AstalBattery.get_default();
        this.batteryIcon = createBinding(this.battery, "batteryIconName");
        this.batteryPercentage = createBinding(this.battery, "percentage");
        this.batteryCharging = createBinding(this.battery, "charging");
        this.batteryCritical = createComputed([this.batteryPercentage, this.batteryCharging], (p, c) => p <= 0.3 && !c);
        this.batteryLifeLabel = createComputed([this.batteryCharging, createBinding(this.battery, "timeToFull"), createBinding(this.battery, "timeToEmpty")], (c, f, e) => c ? `Charging: ${formatTimeVerbose(f)} left` : `Discharging: ${formatTimeVerbose(e)} left`);

        this.cpuSource = new GTop.glibtop_cpu();
        this.memSource = new GTop.glibtop_mem();

        this.cpuData = { prev: { user: 0, sys: 0, total: 0 }, diff: { user: 0, sys: 0, total: 0 } };

        this._metrics = createPoll({ cpu: 0, mem: 0 }, pollTime, () => {
            try {
                GTop.glibtop_get_cpu(this.cpuSource);
                GTop.glibtop_get_mem(this.memSource);

                const cpu = this.cpuSource;

                const prev = this.cpuData.prev;

                this.cpuData.diff = {
                    user: cpu.user - prev.user,
                    sys: cpu.sys - prev.sys,
                    total: cpu.total - prev.total
                }

                this.cpuData.prev = {
                    user: cpu.user,
                    sys: cpu.sys,
                    total: cpu.total
                }

                const cpuDiff = this.cpuData.diff;

                const cpuPercent = Math.round(((cpuDiff.user + cpuDiff.sys) / cpuDiff.total) * 100);
                const memPercent = Math.round((this.memSource.user / this.memSource.total) * 100);

                return { cpu: cpuPercent, mem: memPercent };
            } catch (error) {
                console.warn("Error when obtaining system metrics:", error);
                return { cpu: 0, mem: 0 };
            }
        });
    }

    public get BatteryCritical() {
        return this.batteryCritical;
    }

    private get Cpu() {
        return (
            <box cssClasses={["Cpu"]}>
                <label cssClasses={['Icon']} label={''} />
                <slider cssClasses={["Slider"]} value={this._metrics(m => m.cpu)} step={1} min={0} max={100} sensitive={false} hexpand />
                <label cssClasses={['PercentageLabel']} label={this._metrics(m => `${m.cpu}%`)} widthChars={4} />
            </box>
        );
    }

    private get Memory() {
        return (
            <box cssClasses={["Memory"]}>
                <label cssClasses={['Icon']} label={'󰘚'} />
                <slider cssClasses={["Slider"]} value={this._metrics(m => m.mem)} step={1} min={0} max={100} sensitive={false} hexpand />
                <label cssClasses={['PercentageLabel']} label={this._metrics(m => `${m.mem}%`)} widthChars={4} />
            </box>
        );
    }

    private get Battery() {
        return (
            <box cssClasses={["Battery"]}>
                <image cssClasses={["Icon"]} iconName={this.batteryIcon} />
                <slider cssClasses={["Slider"]} value={this.batteryPercentage} step={0.1} min={0} max={1} sensitive={false} hexpand />
                <label cssClasses={["PercentageLabel"]} label={this.batteryPercentage(p => `${Math.round(Math.min(1, p) * 100) ?? 0}%`)} widthChars={4} />
            </box>
        );
    }

    public get SystemMonitor() {
        return (
            <box cssClasses={["SystemMonitor"]} orientation={Gtk.Orientation.VERTICAL}>
                {this.Cpu}
                {this.Memory}
                {this.Battery}
                <label cssClasses={["StatusLabel"]} visible={this.batteryPercentage(p => p < 1)} label={this.batteryLifeLabel} />
            </box>
        );
    }
}

const systemMonitor = new SystemMonitorClass;
export default systemMonitor;
