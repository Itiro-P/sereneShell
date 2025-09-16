import AstalBattery from "gi://AstalBattery"
import GTop from "gi://GTop?version=2.0";
import { formatTimeVerbose } from "../services/TimeFormatter";
import { Accessor, createBinding, createComputed, createState, onCleanup } from "ags";
import { createPoll } from "ags/time";
import { Gtk } from "ags/gtk4";

type Metrics = {
    cpu: number,
    mem: number
}

type IndicatorWidgets = {
    icon: Gtk.Widget,
    label: Gtk.Widget
}

const pollTime = 3000;

class SystemMonitorClass {
    private battery: AstalBattery.Device;
    private batteryPercentage: Accessor<number>;
    private batteryCharging: Accessor<boolean>;
    private batteryCritical: Accessor<string[]>;
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
        this.batteryCritical = createComputed([this.batteryPercentage, this.batteryCharging], (p, c) => ["Battery", p <= 0.3 && !c ? "BatteryCritical" : "BatteryNormal"]);
        this.batteryLifeLabel = this.batteryCharging(c => c ? `Charging: ${formatTimeVerbose(this.battery.time_to_full)} left` : `Discharging: ${formatTimeVerbose(this.battery.time_to_empty)} left`);

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

    private indicator(widgets: IndicatorWidgets, cssClasses?: string[] | Accessor<string[]>) {
        const [hoveredChild, setHoveredChild]= createState(widgets.icon);

        return (
            <box>
                <Gtk.EventControllerMotion
                    onEnter={() => setHoveredChild(widgets.label)}
                    onLeave={() => setHoveredChild(widgets.icon)}
                />
                <stack
                    cssClasses={cssClasses}
                    visibleChild={hoveredChild}
                    transitionType={Gtk.StackTransitionType.CROSSFADE}
                    transitionDuration={200}
                >
                    {widgets.icon}
                    {widgets.label}
                </stack>
            </box>
        );
    }

    public get SystemMonitor() {
        return (
            <box cssClasses={["SystemMonitor"]}>
                {this.indicator(
                    {
                        icon: <label cssClasses={['Icon']} label={''} /> as Gtk.Widget,
                        label: <label cssClasses={['Label']} label={this._metrics(m => `${m.cpu}%`)} widthChars={4} />  as Gtk.Widget
                    },
                    ["CpuUsage"]
                )}

                {this.indicator(
                    {
                        icon: <label cssClasses={['Icon']} label={'󰘚'} />  as Gtk.Widget,
                        label: <label cssClasses={['Label']} label={this._metrics(m => `${m.mem}%`)} widthChars={4} />  as Gtk.Widget
                    },
                    ["MemoryUsage"]
                )}

                {this.indicator(
                    {
                        icon: <image cssClasses={["BatteryIcon"]} iconName={this.batteryIcon} /> as Gtk.Widget,
                        label: <label cssClasses={["BatteryUsageLabel"]} label={this.batteryPercentage(p => `${Math.round(Math.min(1, p) * 100) ?? 0}%`)} widthChars={4} />  as Gtk.Widget
                    },
                    this.batteryCritical
                )}
            </box>
        );
    }
}

const systemMonitor = new SystemMonitorClass;
export default systemMonitor;
