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
        this.batteryLifeLabel = this.batteryCharging.as(c => c ? `Carregando: ${formatTimeVerbose(this.battery.time_to_full)} restante(s)` : `Descarregando: ${formatTimeVerbose(this.battery.time_to_empty)} restante(s)`);

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

                const cpuPercent = cpuDiff.total > 0 ? Math.round(((cpuDiff.user + cpuDiff.sys) / cpuDiff.total) * 100) : 0;
                const memPercent = this.memSource.total > 0 ? Math.round((this.memSource.user / this.memSource.total) * 100) : 0;

                return { cpu: Math.min(100, cpuPercent), mem: Math.min(100, memPercent) };
            } catch (error) {
                console.warn("Erro ao obter métricas do sistema:", error);
                return { cpu: 0, mem: 0 };
            }
        });
    }

    private indicator(widgets: IndicatorWidgets, cssClasses?: string[] | Accessor<string[]>) {
        const [hoveredChild, setHoveredChild]= createState(widgets.icon);
        const hover = new Gtk.EventControllerMotion;
        const onEnter = hover.connect('enter', () => setHoveredChild(widgets.label));
        const onLeave = hover.connect('leave', () => setHoveredChild(widgets.icon));

        onCleanup(() => {
            hover.disconnect(onEnter);
            hover.disconnect(onLeave);
        });

        return (
            <box $={self => self.add_controller(hover)}>
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
                        label: <label cssClasses={['Label']} label={this._metrics.as(m => `${m.cpu}%`)} widthChars={4} />  as Gtk.Widget
                    },
                    ["CpuUsage"]
                )}

                {this.indicator(
                    {
                        icon: <label cssClasses={['Icon']} label={'󰘚'} />  as Gtk.Widget,
                        label: <label cssClasses={['Label']} label={this._metrics.as(m => `${m.mem}%`)} widthChars={4} />  as Gtk.Widget
                    },
                    ["MemoryUsage"]
                )}

                {this.indicator(
                    {
                        icon: <image cssClasses={["BatteryIcon"]} iconName={this.batteryIcon} /> as Gtk.Widget,
                        label: <label cssClasses={["BatteryUsageLabel"]} label={this.batteryPercentage.as(p => `${Math.round(Math.min(1, p) * 100) ?? 0}%`)} widthChars={4} />  as Gtk.Widget
                    },
                    this.batteryCritical
                )}
            </box>
        );
    }
}

const systemMonitor = new SystemMonitorClass;
export default systemMonitor;
