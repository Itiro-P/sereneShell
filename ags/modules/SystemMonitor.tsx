import AstalBattery from "gi://AstalBattery"
import { Variable, bind, exec } from "astal"
import GTop from "gi://GTop?version=2.0";
import { Gtk } from "astal/gtk4";
import { formatTimeVerbose } from "../services/TimeFormatter";
import { animationsEnabled, syncAnimationState, toggleAnimations } from "../services/Animations";

const POLL_INTERVAL = 3000;
const cpu = new GTop.glibtop_cpu();
const mem = new GTop.glibtop_mem();
const battery = AstalBattery.get_default();
const batteryPercentage = bind(battery, "percentage");
const isCharging = bind(battery, "charging");
const isCritical = Variable.derive([batteryPercentage, isCharging], (p, c) => ["Battery", p <= 0.3 && !c ? "BatteryCritical" : "BatteryNormal"]);
const batteryLifeLabel = Variable.derive([isCharging], (c) => c ? `Carregando: ${formatTimeVerbose(battery.time_to_full)} restante(s)` : `Descarregando: ${formatTimeVerbose(battery.time_to_empty)} restante(s)`);


const cpuData = {
    prev: { user: 0, sys: 0, total: 0 },
    diff: { user: 0, sys: 0, total: 0 }
};

GTop.glibtop_get_cpu(cpu);
cpuData.prev.user = cpu.user;
cpuData.prev.sys = cpu.sys;
cpuData.prev.total = cpu.total;

const calculateMetrics = () => {
    try {
        const prevUser = cpuData.prev.user;
        const prevSys = cpuData.prev.sys;
        const prevTotal = cpuData.prev.total;

        GTop.glibtop_get_cpu(cpu);
        GTop.glibtop_get_mem(mem);

        cpuData.diff.user = cpu.user - prevUser;
        cpuData.diff.sys = cpu.sys - prevSys;
        cpuData.diff.total = cpu.total - prevTotal;

        cpuData.prev.user = cpu.user;
        cpuData.prev.sys = cpu.sys;
        cpuData.prev.total = cpu.total;

        const cpuPercent = cpuData.diff.total > 0
            ? Math.round(((cpuData.diff.user + cpuData.diff.sys) / cpuData.diff.total) * 100)
            : 0;
        const memPercent = mem.total > 0
            ? Math.round((mem.user / mem.total) * 100)
            : 0;

        return {
            cpu: Math.max(0, Math.min(100, cpuPercent)),
            mem: Math.max(0, Math.min(100, memPercent))
        };
    } catch (error) {
        console.warn("Erro ao obter métricas do sistema:", error);
        return { cpu: 0, mem: 0 };
    }
};

const metrics = Variable({ cpu: 0, mem: 0 }).poll(POLL_INTERVAL, calculateMetrics);

function CpuUsage() {
    return (
        <label cssClasses={["CpuUsage"]} label={bind(metrics).as(m => `CPU: ${m.cpu}%`)} widthChars={4} />
    );
}

function MemoryUsage() {
    return (
        <label cssClasses={["MemoryUsage"]} label={bind(metrics).as(m => `MEM: ${m.mem}%`)} widthChars={4} />
    );
}

function BatteryPopover() {
    const toggleAnimationsClick = new Gtk.GestureClick();
    const handler = toggleAnimationsClick.connect("pressed", () => {
        syncAnimationState();
        toggleAnimations();
    });
    return (
        <popover
            onShow={() => syncAnimationState()}
            child={
                <box cssClasses={["BatteryPopover"]} orientation={Gtk.Orientation.VERTICAL}>
                    <label cssClasses={["Title"]} label={"Informaçoẽs da bateria"} />
                    <label cssClasses={["BatteryLife"]} label={bind(batteryLifeLabel)} />
                    <label
                        cssClasses={["ToggleButton"]}
                        setup={(self) => self.add_controller(toggleAnimationsClick)}
                        onDestroy={() => toggleAnimationsClick.disconnect(handler)}
                        label={bind(animationsEnabled).as(ae => ae ? "Desativar animações" : "Ativar animações")}
                        widthChars={20}
                    />
                    <box />
                </box>
            }
        />
    );
}

function Battery() {
    return (
        <menubutton
            cssClasses={bind(isCritical)}
            tooltipText={bind(batteryLifeLabel)}
            child={
                <box>
                    <image cssClasses={["BatteryIcon"]} iconName={bind(battery, "batteryIconName")} />
                    <label cssClasses={["BatteryUsageLabel"]} label={bind(battery, "percentage").as(p => `${Math.round(Math.max(0, Math.min(100, p * 100))) ?? 0}%`)} />
                </box>
            }

            popover={<BatteryPopover /> as Gtk.Popover}
        />
    );
};

export default function SystemMonitor() {
    return (
        <box cssClasses={["SystemMonitor"]} onDestroy={() => metrics.drop()}>
            <CpuUsage />
            <MemoryUsage />
            <Battery />
        </box>
    );
}
