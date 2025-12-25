import AstalBattery from "gi://AstalBattery"
import GTop from "gi://GTop?version=2.0";
import { formatTimeVerbose } from "../services";
import { Accessor, createBinding, createComputed } from "ags";
import { createPoll } from "ags/time";

type Metrics = {
    cpu: number,
    mem: number
}

const POLLTIME = 3000;

class SystemMonitorClass {
    private _battery: AstalBattery.Device;
    private _batteryIcon: Accessor<string>;
    private _batteryPercentage: Accessor<number>;
    private _batteryCharging: Accessor<boolean>;
    private _batteryCritical: Accessor<boolean>;
    private _batteryLifeLabel: Accessor<string>;

    private _cpuSource: GTop.glibtop_cpu;
    private _cpuData: { prev: { user: number, sys: number, total: number }, diff: { user: number, sys: number, total: number } };
    private _memSource: GTop.glibtop_mem;
    private _metrics: Accessor<Metrics>;

    public constructor() {
        this._battery = AstalBattery.get_default();
        this._batteryIcon = createBinding(this._battery, "batteryIconName");
        this._batteryPercentage = createBinding(this._battery, "percentage");
        this._batteryCharging = createBinding(this._battery, "charging");
        this._batteryCritical = createComputed(() => this._batteryPercentage() <= 0.3 && !this._batteryCharging());
        this._batteryLifeLabel = createComputed(() => this._batteryCharging() ? `Charging: ${formatTimeVerbose(createBinding(this._battery, "timeToFull")())} left` : `Discharging: ${formatTimeVerbose(createBinding(this._battery, "timeToEmpty")())} left`);

        this._cpuSource = new GTop.glibtop_cpu();
        this._memSource = new GTop.glibtop_mem();

        this._cpuData = { prev: { user: 0, sys: 0, total: 0 }, diff: { user: 0, sys: 0, total: 0 } };

        this._metrics = createPoll({ cpu: 0, mem: 0 }, POLLTIME, () => {
            try {
                GTop.glibtop_get_cpu(this._cpuSource);
                GTop.glibtop_get_mem(this._memSource);

                const cpu = this._cpuSource;

                const prev = this._cpuData.prev;

                this._cpuData.diff = {
                    user: cpu.user - prev.user,
                    sys: cpu.sys - prev.sys,
                    total: cpu.total - prev.total
                }

                this._cpuData.prev = {
                    user: cpu.user,
                    sys: cpu.sys,
                    total: cpu.total
                }

                const cpuDiff = this._cpuData.diff;

                const cpuPercent = Math.round(((cpuDiff.user + cpuDiff.sys) / cpuDiff.total) * 100);
                const memPercent = Math.round((this._memSource.user / this._memSource.total) * 100);

                return { cpu: cpuPercent, mem: memPercent };
            } catch (error) {
                console.warn("Error when obtaining system metrics:", error);
                return { cpu: 0, mem: 0 };
            }
        });
    }

    public get batteryIcon() {
        return this._batteryIcon;
    }

    public get batteryPercentage() {
        return this._batteryPercentage;
    }

    public get batteryCharging() {
        return this._batteryCharging;
    }

    public get batteryCritical() {
        return this._batteryCritical;
    }

    public get batteryLifeLabel() {
        return this._batteryLifeLabel;
    }

    public get metrics() {
        return this._metrics;
    }
}

export const systemMonitorService = new SystemMonitorClass();
