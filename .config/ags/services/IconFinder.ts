import { readFile, writeFileAsync } from "ags/file";
import { Gdk, Gtk } from "ags/gtk4";
// Removi execAsync pois não precisamos mais dele (performance)
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";

const path = GLib.get_home_dir() + "/.config/ags/jsons/iconNames.json";

class IconFinderClass {
    private iconMap: Map<string, string>;
    private iconTheme: Gtk.IconTheme;

    constructor() {
        this.iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);

        try {
            const file = readFile(path);
            const jsonContent = JSON.parse(file);
            this.iconMap = new Map(jsonContent);
        } catch(e) {
            this.iconMap = new Map();
        }
    }

    private getIconCandidates(className: string): string[] {
        if (!className) return [];

        const c = className.toLowerCase();
        const iconCandidates = new Set<string>();

        iconCandidates.add(c);
        iconCandidates.add(c.replace(/\s+/g, "-"));
        iconCandidates.add(c.replace(/_/g, "-"));

        if (c.includes(".")) {
            const parts = c.split(".");
            const lastPart = parts[parts.length - 1];
            iconCandidates.add(lastPart);
            iconCandidates.add(lastPart.replace(/_/g, "-"));
            iconCandidates.add(parts[0]);
        }

        if (c.includes("-")) {
            const parts = c.split("-");
            if (parts.length > 2) {
                iconCandidates.add(parts[parts.length - 1]);
            }
        }

        return [...iconCandidates];
    }

    private findAppInfoIcon(windowClass: string): string | null {
        const candidates = this.getIconCandidates(windowClass);

        const allApps = Gio.AppInfo.get_all();

        for (const app of allApps) {
            const id = app.get_id();
            if (!id) continue;

            const cleanId = id.replace(".desktop", "").toLowerCase();

            const match = candidates.some(cand => cleanId === cand || cleanId.endsWith(cand));

            if (match) {
                const icon = app.get_icon();
                if (icon) {
                    return icon.to_string();
                }
            }
        }
        return null;
    }

    private findFromGtk(initialClass: string): string | undefined {
        const iconCandidates = this.getIconCandidates(initialClass);
        return iconCandidates.find(name => this.iconTheme.has_icon(name));
    }

    public findIcon(initialClass: string) {
        if (this.iconMap.has(initialClass)) {
            return this.iconMap.get(initialClass)!;
        }

        let icon: string | null = null;

        const gtkIcon = this.findFromGtk(initialClass);
        if (gtkIcon) {
            icon = gtkIcon;
        }

        else {
            icon = this.findAppInfoIcon(initialClass);
        }

        const finalIcon = icon || "application-x-executable";

        this.iconMap.set(initialClass, finalIcon);

        return finalIcon;
    }

    public saveIconNames() {
        const toSave = JSON.stringify([...this.iconMap.entries()], null, 2);
        writeFileAsync(path, toSave).catch(err => console.error("Erro ao salvar ícones", err));
    }
}

export const iconFinder = new IconFinderClass();
