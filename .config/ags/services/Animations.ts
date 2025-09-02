import { exec } from "ags/process";
import settingsService from "./Settings";

class Animations {

    constructor() {
        // Aplicar configurações de animação.
        this.toggleAnimations(settingsService.animationsEnabled.get());
    }

    public get animationState() {
        try {
            return JSON.parse(exec("hyprctl getoption animations:enabled -j")) === 1;
        } catch (error) {
            console.warn("Erro ao verificar estado das animações:", error);
            return false;
        }
    }

    public toggleAnimations(val ?: boolean) {
        const newState = val ?? !this.animationState;
        try {
            exec(`hyprctl keyword animations:enabled ${newState ? 1 : 0}`);
            exec(`hyprctl keyword decoration:shadow:enabled ${newState ? 1 : 0}`);
        } catch (error) {
            console.error("Erro ao alterar animações:", error);
        }
    }
}

const animationService = new Animations;

export default animationService;
