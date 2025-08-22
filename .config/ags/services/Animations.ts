import { exec } from "ags/process";
import { Accessor, createState, Setter } from "ags";

class Animations {
    private _animationsEnabled: Accessor<boolean>;
    private _setAnimationsEnabled: Setter<boolean>;

    constructor() {
        [this._animationsEnabled, this._setAnimationsEnabled] = createState(this.animationState);
    }

    public get animationState() {
        try {
            const result = exec("hyprctl getoption animations:enabled -j");
            const parsed = JSON.parse(result);
            return parsed.int === 1;
        } catch (error) {
            console.warn("Erro ao verificar estado das animações:", error);
            return false;
        }
    }

    public syncAnimationState() {
        this._setAnimationsEnabled(this.animationState);
    }

    public toggleAnimations() {
        const newState = !this.animationState;

        try {
            exec(`hyprctl keyword animations:enabled ${newState ? 1 : 0}`);
            exec(`hyprctl keyword decoration:shadow:enabled ${newState ? 1 : 0}`);
            this._setAnimationsEnabled(newState);
        } catch (error) {
            console.error("Erro ao alterar animações:", error);
            this.syncAnimationState();
        }
    }

    public get animationsEnabled() {
        return this._animationsEnabled;
    }

    public set setAnimationsEnabled(newState: boolean) {
        this._setAnimationsEnabled(newState);
    }
}

const animationService = new Animations;

export default animationService;
