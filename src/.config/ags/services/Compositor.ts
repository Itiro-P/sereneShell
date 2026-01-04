import { Gdk } from "ags/gtk4";
import { exec } from "ags/process";
import { ICompositor } from "./Compositors";
import { Hyprland, Niri } from "./Compositors";
import { settingsService } from "./Settings";
import { createEffect, createRoot, createState } from "ags";

class CompositorClass {
    private compositor: ICompositor | null = null;

    public constructor() {
        const out = exec(["bash", "-c", "echo $XDG_CURRENT_DESKTOP"]);
        switch(out) {
            case "hyprland":
            case "Hyprland":
                this.compositor = new Hyprland;
                break;
            case "niri":
            case "Niri":
                this.compositor = new Niri;
                break;
            default:
                console.warn("Compositor not identified/supported " + out);
                this.compositor = null;
        }
        createRoot(() => {
            createEffect(() => {
                const result = settingsService.animationsEnabled();
                if (result) this.compositor?.toggleAnimations(result);
            });
        });
    }

    public get workspaces() {
        return this.compositor?.getWorkspaces();
    }

    public get focusedWorkspace() {
        return this.compositor?.getFocusedWorkspace();
    }

    public get clients() {
        return this.compositor?.getClients();
    }

    public get focusedClient() {
        return this.compositor?.getFocusedClient();
    }

    public getCompositorMonitor(monitor: Gdk.Monitor) {
        return this.compositor?.getCompositorMonitor(monitor) ?? createState(undefined)[0];
    }

    public get animationState() {
        return this.compositor?.getAnimationState() ?? false;
    }
}

export const compositorService = new CompositorClass;
