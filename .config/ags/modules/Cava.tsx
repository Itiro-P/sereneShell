import { Gdk, Gtk } from "ags/gtk4";
import Gsk from 'gi://Gsk';
import AstalCava from "gi://AstalCava?version=0.1";
import GObject from 'gi://GObject';
import { Accessor, createBinding, createComputed, createState, onCleanup, Setter } from "ags";
import hyprlandService from "../services/Hyprland";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

const CavaConfig = {
    autosens: true,
    bars: 25,
    framerate: 60,
    input: AstalCava.Input.PIPEWIRE,
    noiseReduction: 0.77,
    sensitivity: 0.75,
    stereo: false,
};

export enum CavaVisiblity {
    ALWAYS,
    NO_CLIENTS,
    DISABLED
}

class CavaWidget extends Gtk.DrawingArea {
    private valuesAccessor: Accessor<number[]>;
    private unsubAccessor: () => void;

    constructor(v: Accessor<number[]>) {
        super();
        this.set_hexpand(true);
        this.set_vexpand(true);
        this.valuesAccessor = v.as(v => {
            const height = this.get_allocated_height();
            return v.map(i => height - height * Math.min(1, i));
        });
        this.unsubAccessor = this.valuesAccessor.subscribe(() => this.queue_draw());

        onCleanup(() => this.unsubAccessor());
    }

    override vfunc_snapshot(snapshot: Gtk.Snapshot): void {
        if (!this.get_mapped()) return;

        try {
            if (!this.visible) return;

            const width = this.get_allocated_width();
            const height = this.get_allocated_height();

            if (width <= 0 || height <= 0) return;

            const values = this.valuesAccessor.get();

            if (values.length === 0) return;

            const barWidth = width / (values.length - 1);
            const color = this.parent.get_color();
            const builder = new Gsk.PathBuilder();
            builder.move_to(0, values[0]);
            const invSix = 1 / 6;

            for (let i = 0; i < values.length - 1; i++) {
                const p0x = (i - 1) * barWidth;
                const p0y = values[Math.max(0, i - 1)];
                const p1x = i * barWidth;
                const p1y = values[i];
                const p2x = (i + 1) * barWidth;
                const p2y = values[i + 1];
                const p3x = (i + 2) * barWidth;
                const p3y = values[Math.min(values.length - 1, i + 2)];

                const c1x = p1x + (p2x - p0x) * invSix;
                const c1y = p1y + (p2y - p0y) * invSix;
                const c2x = p2x - (p3x - p1x) * invSix;
                const c2y = p2y - (p3y - p1y) * invSix;

                builder.cubic_to(c1x, c1y, c2x, c2y, p2x, p2y);
            }

            builder.line_to(width, height);
            builder.line_to(0, height);
            builder.close();

            snapshot.append_fill(builder.to_path(), Gsk.FillRule.WINDING, color);
        } catch (error) {
            console.warn("Erro no snapshot do Cava:", error);
        }
    }
}

const _cava = GObject.registerClass({ GTypeName: 'Cava' }, CavaWidget);

class CavaClass {
    private default: AstalCava.Cava | null;
    private _values: Accessor<number[]>;

    private _visibilityState: Accessor<CavaVisiblity>;
    private _setVisibilityState: Setter<CavaVisiblity>;

    public constructor() {
        [this._visibilityState, this._setVisibilityState] = createState<CavaVisiblity>(CavaVisiblity.ALWAYS);

        this.default = AstalCava.get_default();
        if (this.default) {
            this.default.set_autosens(CavaConfig.autosens);
            this.default.set_bars(CavaConfig.bars);
            this.default.set_framerate(CavaConfig.framerate);
            this.default.set_input(CavaConfig.input);
            this.default.set_noise_reduction(CavaConfig.noiseReduction);
            this.default.set_stereo(CavaConfig.stereo);
            this._values = createBinding(this.default, 'values').as((v) => {
                try {
                    const sens = CavaConfig.sensitivity;
                    return v.map((i) => i * sens);
                } catch (error) {
                    console.warn("Erro no handler global do Cava:", error);
                    return [];
                }
            });
        }
        else {
            console.error("Não foi possível inicializar o Cava");
            this._values = createState<number[]>([])[0];
        }
    }

    public shouldCavaAppear(monitor: AstalHyprland.Monitor) {
        return createComputed([this._visibilityState],
            (vs) => {
                switch(vs) {
                    case CavaVisiblity.DISABLED:
                        return false;
                    case CavaVisiblity.ALWAYS:
                        return true;
                    case CavaVisiblity.NO_CLIENTS:
                        return hyprlandService.visibilityAccessor(monitor);
                }
            }
        );
    }

    public toggleVisibilityState() {
        switch(this._visibilityState.get()) {
            case CavaVisiblity.ALWAYS:
                this._setVisibilityState(CavaVisiblity.NO_CLIENTS);
                break;
            case CavaVisiblity.NO_CLIENTS:
                this._setVisibilityState(CavaVisiblity.DISABLED);
                break;
            case CavaVisiblity.DISABLED:
                this._setVisibilityState(CavaVisiblity.ALWAYS);
                break;
            default:
                this._setVisibilityState(CavaVisiblity.DISABLED);
        }
    }

    public get visibilityState() {
        return this._visibilityState;
    }



    public Cava(cssClasses: string[]) {
        return (
            <box cssClasses={[...cssClasses, "Cava"]} overflow={Gtk.Overflow.HIDDEN}>
                {new _cava(this._values)}
            </box>
        );
    }
}

const cava = new CavaClass;

export default cava;
