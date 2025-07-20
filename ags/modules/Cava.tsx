import { Gtk } from "ags/gtk4";
import Gsk from 'gi://Gsk';
import AstalCava from "gi://AstalCava?version=0.1";
import GObject from 'gi://GObject';
import { hasAnyClient } from "../services/Hyprland";
import { animationsEnabled } from "../services/Animations";
import { createComputed } from "ags";

const CavaConfig = {
    autosens: true,
    bars: 20,
    barWidth: 20,
    barHeight: 160,
    framerate: 60,
    input: AstalCava.Input.PIPEWIRE,
    noiseReduction: 0.77,
    sensitivity: 0.75,
    stereo: false,
    lerpFactor: 1
};

let cavaInstance: AstalCava.Cava | null = null;
let globalHandler: number | null = null;
let activeWidgets: Set<CavaWidget> = new Set();

let cavaValues = new Float32Array(CavaConfig.bars);
let cavaNorm = new Float32Array(CavaConfig.bars);

function initializeCava(): AstalCava.Cava | null {
    if (!cavaInstance) {
        try {
            cavaInstance = AstalCava.get_default();
            if (!cavaInstance) {
                console.log("Cava instance not found");
                return null;
            }

            cavaInstance.set_autosens(CavaConfig.autosens);
            cavaInstance.set_bars(CavaConfig.bars);
            cavaInstance.set_framerate(CavaConfig.framerate);
            cavaInstance.set_input(CavaConfig.input);
            cavaInstance.set_noise_reduction(CavaConfig.noiseReduction);
            cavaInstance.set_stereo(CavaConfig.stereo);
        } catch (error) {
            console.warn("Erro ao inicializar Cava:", error);
        }
    }
    return cavaInstance;
}

function setupGlobalHandler() {
    if (!globalHandler && cavaInstance) {
        globalHandler = cavaInstance.connect("notify::values", () => {
            try {
                const raw = cavaInstance!.get_values();
                if (!raw || raw.length === 0) return;

                const bars = Math.min(CavaConfig.bars, raw.length);
                const sens = CavaConfig.sensitivity;
                const lerp = CavaConfig.lerpFactor;

                for (let i = 0; i < bars; i++) {
                    const vRaw = (raw[i] || 0) * sens;
                    cavaValues[i] += (vRaw - cavaValues[i]) * lerp;
                }

                activeWidgets.forEach(widget => {
                    if (widget.get_mapped() && widget.get_realized()) {
                        widget.queue_draw();
                    }
                });
            } catch (error) {
                console.warn("Erro no handler global do Cava:", error);
            }
        });
    }
}

function cleanupGlobalHandler() {
    if (globalHandler && cavaInstance && activeWidgets.size === 0) {
        try {
            cavaInstance.disconnect(globalHandler);
            globalHandler = null;
        } catch (error) {
            console.warn("Erro ao desconectar handler global:", error);
        }
    }
}

function registerWidget(widget: CavaWidget) {
    activeWidgets.add(widget);

    if (!cavaInstance) {
        initializeCava();
    }

    if (activeWidgets.size === 1) {
        setupGlobalHandler();
    }
}

function unregisterWidget(widget: CavaWidget) {
    activeWidgets.delete(widget);

    if (activeWidgets.size === 0) {
        cleanupGlobalHandler();
    }
}

class CavaWidget extends Gtk.DrawingArea {
    private _lastWidth = 0;
    private _lastHeight = 0;

    constructor() {
        super();
        this.set_hexpand(true);
        this.set_vexpand(true);

        registerWidget(this);
    }

    override vfunc_size_allocate(width: number, height: number, baseline: number): void {
        super.vfunc_size_allocate(width, height, baseline);

        if (this._lastWidth !== width || this._lastHeight !== height) {
            this._lastWidth = width;
            this._lastHeight = height;
            this.queue_draw();
        }
    }

    override vfunc_snapshot(snapshot: Gtk.Snapshot): void {
        if (!cavaInstance || !this.get_mapped()) return;

        try {
            if (!this.visible) return;

            const width = this.get_allocated_width();
            const height = this.get_allocated_height();

            if (width <= 0 || height <= 0) return;

            this.draw_catmull_rom(snapshot, width, height);
        } catch (error) {
            console.warn("Erro no snapshot do Cava:", error);
        }
    }

    private draw_catmull_rom(snapshot: Gtk.Snapshot, width: number, height: number): void {
        try {
            const bars = CavaConfig.bars;
            if (bars === 0) return;

            const barWidth = width / (bars - 1);
            const color = this.parent.get_color();

            for (let i = 0; i < bars; i++) {
                const v = Math.max(0, Math.min(1, cavaValues[i]));
                cavaNorm[i] = height - height * v;
            }

            const builder = new Gsk.PathBuilder();
            builder.move_to(0, cavaNorm[0]);

            const invSix = 1 / 6;
            for (let i = 0; i < bars - 1; i++) {
                const p0x = (i - 1) * barWidth;
                const p0y = cavaNorm[Math.max(0, i - 1)];
                const p1x = i * barWidth;
                const p1y = cavaNorm[i];
                const p2x = (i + 1) * barWidth;
                const p2y = cavaNorm[i + 1];
                const p3x = (i + 2) * barWidth;
                const p3y = cavaNorm[Math.min(bars - 1, i + 2)];

                const c1x = p1x + (p2x - p0x) * invSix;
                const c1y = p1y + (p2y - p0y) * invSix;
                const c2x = p2x - (p3x - p1x) * invSix;
                const c2y = p2y - (p3y - p1y) * invSix;

                builder.cubic_to(c1x, c1y, c2x, c2y, p2x, p2y);
            }

            builder.line_to(width, height);
            builder.line_to(0, height);
            builder.close();

            const path = builder.to_path();
            if (path) {
                snapshot.append_fill(path, Gsk.FillRule.WINDING, color);
            }

        } catch (error) {
            console.warn("Erro ao desenhar Cava:", error);
        }
    }

    public destroy() {
        unregisterWidget(this);
    }
}

const _cava = GObject.registerClass({ GTypeName: 'Cava' }, CavaWidget);

const shouldCavaAppear = createComputed([hasAnyClient, animationsEnabled], (hac, an) => !hac && !an);

export function Cava() {
    return (
        <box cssClasses={["Cava"]} overflow={Gtk.Overflow.HIDDEN} visible={shouldCavaAppear}>
            {new _cava()}
        </box>
    );
}

export function CavaOverlay() {
    return (
        <box cssClasses={["CavaOverlay"]} visible={animationsEnabled}>
            {new _cava()}
        </box>
    );
}
