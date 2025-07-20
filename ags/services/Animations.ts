import { exec } from "ags/process";
import { createState } from "ags";

export const getAnimationState = () => {
    try {
        const result = exec("hyprctl getoption animations:enabled -j");
        const parsed = JSON.parse(result);
        return parsed.int === 1;
    } catch (error) {
        console.warn("Erro ao verificar estado das animações:", error);
        return false;
    }
};

export const [animationsEnabled, setAnimationsEnabled] = createState(getAnimationState());

export function syncAnimationState() {
    setAnimationsEnabled(getAnimationState());
}

export function toggleAnimations() {
    const newState = !animationsEnabled.get();

    try {
        exec(`hyprctl keyword animations:enabled ${newState ? 1 : 0}`);
        exec(`hyprctl keyword decoration:shadow:enabled ${newState ? 1 : 0}`);
        setAnimationsEnabled(newState);
    } catch (error) {
        console.error("Erro ao alterar animações:", error);
        syncAnimationState();
    }
}
