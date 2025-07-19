import { bind, Variable } from "astal";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export const hyprland = AstalHyprland.get_default();

export const workspaces = bind(hyprland, "workspaces");
export const focusedWorkspace = bind(hyprland, "focusedWorkspace");

export const clients = bind(hyprland, "clients");
export const focusedClient = bind(hyprland, "focusedClient");

export const hasAnyClient = Variable.derive([focusedClient], (fc) => !fc || fc.floating && fc.workspace.clients.length <= 1);
