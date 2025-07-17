import { Gtk } from "astal/gtk4";
import { mediaState } from "./Media";
import Gsk from 'gi://Gsk';
import AstalCava from "gi://AstalCava?version=0.1";
import GObject from 'gi://GObject';
import { bind, Variable } from "astal";

export const cavaOnBackground = Variable<boolean>(false);

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

const cavaInstance = AstalCava.get_default();
if(!cavaInstance) console.log("Cava instance not found");
cavaInstance?.set_autosens(CavaConfig.autosens);
cavaInstance?.set_bars(CavaConfig.bars);
cavaInstance?.set_framerate(CavaConfig.framerate);
cavaInstance?.set_input(CavaConfig.input);
cavaInstance?.set_noise_reduction(CavaConfig.noiseReduction);
cavaInstance?.set_stereo(CavaConfig.stereo);

class CavaWidget extends Gtk.DrawingArea {
    private values!: Float32Array;
    private norm!: Float32Array;
    private _handler: number | null = null;
    private _lastWidth = 0;
    private _lastHeight = 0;
    private _pathBuilder: Gsk.PathBuilder | null = null;

    constructor() {
        super();
        this.setupRect();
        this.setupCava();
        this.set_hexpand(true);
        this.set_vexpand(true);
    }

    private setupRect() {
        this.values = new Float32Array(CavaConfig.bars);
        this.norm = new Float32Array(CavaConfig.bars);
        this.add_css_class("Container");
    }

    private setupCava() {
        try {
            if (cavaInstance && !this._handler) {
                this._handler = cavaInstance.connect("notify::values", () => {
                    if (this.get_mapped() && this.get_realized()) {
                        this.queue_draw();
                    }
                });
            }
        } catch (error) {
            console.warn("Erro ao configurar Cava:", error);
        }
    }

    override vfunc_size_allocate(width: number, height: number, baseline: number): void {
        super.vfunc_size_allocate(width, height, baseline);

        if (this._lastWidth !== width || this._lastHeight !== height) {
            this._lastWidth = width;
            this._lastHeight = height;
            this._pathBuilder = null;

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
        if (!cavaInstance || !mediaState.get().lastPlayer) return;

        try {
            const raw = cavaInstance!.get_values() || null;
            if (!raw || raw.length === 0) return;

            const bars = Math.min(CavaConfig.bars, raw.length);
            if (bars === 0) return;

            const barWidth = width / (bars - 1);
            const color = this.parent.get_color();
            const sens = CavaConfig.sensitivity;
            const lerp = CavaConfig.lerpFactor;
            const invSix = 1 / 6;

            for (let i = 0; i < bars; i++) {
                const vRaw = (raw[i] || 0) * sens;
                const v = this.values[i] += (vRaw - this.values[i]) * lerp;
                this.norm[i] = height - height * Math.max(0, Math.min(1, v));
            }

            const builder = this._pathBuilder = new Gsk.PathBuilder();

            builder.move_to(0, this.norm[0]);

            for (let i = 0; i < bars - 1; i++) {

                const p0x = (i - 1) * barWidth;
                const p0y = this.norm[Math.max(0, i - 1)];
                const p1x = i * barWidth;
                const p1y = this.norm[i];
                const p2x = (i + 1) * barWidth;
                const p2y = this.norm[i + 1];
                const p3x = (i + 2) * barWidth;
                const p3y = this.norm[Math.min(bars - 1, i + 2)];

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
        if (this._handler && cavaInstance) {
            try {
                cavaInstance.disconnect(this._handler);
            } catch (error) {
                console.warn("Erro ao desconectar handler:", error);
            }
            this._handler = null;
        }

        if (this.values) {
            this.values.fill(0);
        }
        if (this.norm) {
            this.norm.fill(0);
        }

        this._pathBuilder = null;
    }
}

const _cava = GObject.registerClass({ GTypeName: 'Cava' }, CavaWidget);

export function Cava() {
    return (
        <box cssClasses={["Cava"]} overflow={Gtk.Overflow.HIDDEN} child={new _cava()} visible={bind(cavaOnBackground).as(cob => !cob)} />
    );
}

export function CavaOverlay() {
    return (
        <box cssClasses={["CavaOverlay"]} child={new _cava()} />
    );
}

export function CavaButton() {
    const click = new Gtk.GestureClick();
    const handler = click.connect('pressed', () => cavaOnBackground.set(!cavaOnBackground.get()));
    return (
        <label
            cssClasses={["CavaButton"]}
            setup={(self) => self.add_controller(click)}
            onDestroy={(self) => { self.remove_controller(click); click.disconnect(handler); cavaOnBackground.drop(); }}
            label={bind(cavaOnBackground).as(cob => cob ? '-' : '+')}
        />
    );
}
