import { Gdk } from "ags/gtk4";
import { exec } from "ags/process";
import { ICompositor } from "../types";
import { Hyprland } from "./Compositors";

class CompositorManagerClass {
    private compositor: ICompositor;

    public constructor() {
        const compositor = exec(["bash", "-c", "echo $XDG_CURRENT_DESKTOP"]);
        switch(compositor) {
            case "hyprland":
            case "Hyprland":
                console.log("usando Hyprland");
                this.compositor = new Hyprland;
                break;
            default:
                throw new Error("Compositor não suportado.");
        }
    }

    public get workspaces() {
        return this.compositor.getWorkspaces();
    }

    public get focusedWorkspace() {
        return this.compositor.getFocusedWorkspace();
    }

    public get clients() {
        return this.compositor.getClients();
    }

    public get focusedClient() {
        return this.compositor.getFocusedClient();
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        return this.compositor.getCompositorMonitor(monitor);
    }

    public get animationState() {
        return this.compositor.getAnimationState();
    }

    public toggleAnimations(val?: boolean) {
        if(val) this.compositor.toggleAnimations(val);
    }
}

const compositorManager = new CompositorManagerClass;

export default compositorManager;
