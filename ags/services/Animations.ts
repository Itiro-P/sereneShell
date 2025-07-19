import { exec, Variable } from "astal";


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

export const animationsEnabled = Variable<boolean>(getAnimationState());

export function syncAnimationState() {
    animationsEnabled.set(getAnimationState());
}

export function toggleAnimations() {
    const currentState = animationsEnabled.get();
    const newState = !currentState;

    try {
        exec(`hyprctl keyword animations:enabled ${newState ? 1 : 0}`);
        exec(`hyprctl keyword decoration:shadow:enabled ${newState ? 1 : 0}`);
        animationsEnabled.set(newState);
    } catch (error) {
        console.error("Erro ao alterar animações:", error);
        syncAnimationState();
    }
}
