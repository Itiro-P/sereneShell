import { Accessor, createBinding, createEffect, createRoot, createState, Setter } from "ags";
import AstalCava from "gi://AstalCava?version=0.1";
import { settingsService } from "./Settings";

const CavaConfig = {
    autosens: true,
    bars: 25,
    framerate: 60,
    input: AstalCava.Input.PIPEWIRE,
    noiseReduction: 0.77,
    sensitivity: 0.75,
    stereo: false,
};

class CavaClass {
    private default: AstalCava.Cava | null;
    private _values: Accessor<number[]>;

    private _visibilityState: Accessor<boolean>;
    private _setVisibilityState: Setter<boolean>;

    public constructor() {
        [this._visibilityState, this._setVisibilityState] = createState(settingsService.cavaVisible.peek());
        createRoot(() => createEffect(() => this._setVisibilityState(settingsService.cavaVisible())));

        this.default = AstalCava.get_default();
        if (this.default) {
            this.default.set_autosens(CavaConfig.autosens);
            this.default.set_bars(CavaConfig.bars);
            this.default.set_framerate(CavaConfig.framerate);
            this.default.set_input(CavaConfig.input);
            this.default.set_noise_reduction(CavaConfig.noiseReduction);
            this.default.set_stereo(CavaConfig.stereo);
            this._values = createBinding(this.default, 'values')((v) => {
                try {
                    const sens = CavaConfig.sensitivity;
                    return v.map(i => i * sens);
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

    public get visibilityState() {
        return this._visibilityState;
    }

    public get values() {
        return this._values;
    }
}

export const cavaService = new CavaClass;
