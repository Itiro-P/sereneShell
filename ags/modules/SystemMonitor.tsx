import AstalBattery from "gi://AstalBattery"
import GTop from "gi://GTop?version=2.0";
import { Gtk } from "ags/gtk4";
import { formatTimeVerbose } from "../services/TimeFormatter";
import { createBinding, createComputed, onCleanup } from "ags";
import { createPoll } from "ags/time";

const POLL_INTERVAL = 3000;
const cpu = new GTop.glibtop_cpu();
const mem = new GTop.glibtop_mem();
const battery = AstalBattery.get_default();
const batteryPercentage = createBinding(battery, "percentage");
const isCharging = createBinding(battery, "charging");
const isCritical = createComputed([batteryPercentage, isCharging], (p, c) => ["Battery", p <= 0.3 && !c ? "BatteryCritical" : "BatteryNormal"]);
const batteryLifeLabel = isCharging.as(c => c ? `Carregando: ${formatTimeVerbose(battery.time_to_full)} restante(s)` : `Descarregando: ${formatTimeVerbose(battery.time_to_empty)} restante(s)`);


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

const metrics = createPoll({ cpu: 0, mem: 0 }, POLL_INTERVAL, calculateMetrics);

function CpuUsage() {
    return (
        <label cssClasses={["CpuUsage"]} label={metrics.as(m => `CPU: ${m.cpu}%`)} widthChars={4} />
    );
}

function MemoryUsage() {
    return (
        <label cssClasses={["MemoryUsage"]} label={metrics.as(m => `MEM: ${m.mem}%`)} widthChars={4} />
    );
}

function Battery() {
    return (
        <box cssClasses={isCritical} tooltipText={batteryLifeLabel}>
            <image cssClasses={["BatteryIcon"]} iconName={createBinding(battery, "batteryIconName")} />
            <label cssClasses={["BatteryUsageLabel"]} label={batteryPercentage.as(p => `${Math.round(Math.max(0, Math.min(100, p * 100))) ?? 0}%`)} />
        </box>
    );
};

export default function SystemMonitor() {
    return (
        <box cssClasses={["SystemMonitor"]}>
            <CpuUsage />
            <MemoryUsage />
            <Battery />
        </box>
    );
}
