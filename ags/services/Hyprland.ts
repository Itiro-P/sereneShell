import { createBinding, createComputed } from "ags";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export const hyprland = AstalHyprland.get_default();

export const workspaces = createComputed([createBinding(hyprland, "workspaces")], (workspaces) => workspaces.sort((a, b) => a.id - b.id));
export const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

export const clients = createBinding(hyprland, "clients");
export const focusedClient = createBinding(hyprland, "focusedClient");

export const hasAnyClient = createComputed([focusedClient], (fc) => !fc || fc.floating && fc.workspace.clients.length <= 1);
