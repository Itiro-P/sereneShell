import { readFile, writeFile } from "ags/file";
import { Gdk, Gtk } from "ags/gtk4";
import { exec } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";

interface Icon {
    name: string;
    directory: string;
}

const path = GLib.get_home_dir() + "/.config/ags/jsons/iconNames.json";
const searchPaths = [
    GLib.get_user_data_dir() + "/applications",
    "/usr/local/share/applications",
    "/usr/share/applications"
];

class IconFinderClass {
    private iconMap: Map<string, string> = new Map();
    private iconTheme: Gtk.IconTheme;

    constructor() {
        this.iconMap = new Map();
        this.iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
        const file = readFile(path);
        try {
            const icons: Icon[] = JSON.parse(file);
            for(const icon of icons) this.iconMap.set(icon.name, icon.directory);
        } catch(e) {
            console.error("Erro ao ler iconNames.json" + e);
        }
    }

    private findDesktopEntry(windowClass: string) {
        const possibleNames = [
            windowClass.toLowerCase(),
            windowClass.toLowerCase().replace(/\s+/g, "-"),
            windowClass.toLowerCase().replace(/\s+/g, "_"),
            windowClass.toLowerCase() + ".desktop",
        ];

        for (const basePath of searchPaths) {
            try {
                const dir = Gio.File.new_for_path(basePath);
                if (!dir.query_exists(null)) continue;

                const enumerator = dir.enumerate_children("standard::name", 0, null);
                let fileInfo;

                while ((fileInfo = enumerator.next_file(null))) {
                    const fileName = fileInfo.get_name()!;
                    const baseName = fileName.replace(/\.desktop$/, "");

                    for (const candidate of possibleNames) {
                        if (baseName.toLowerCase() === candidate.toLowerCase()) {
                            const fullPath = basePath + "/" + fileName;
                            const icon = exec(["bash", "-c", `cat ${fullPath} | grep Icon=`]).slice(5);
                            this.iconMap.set(windowClass, icon);
                            return icon;
                        }
                    }
                }
            } catch (e) {
                break;
            }
        }
    }

    private getIconCandidates(className: string): string[] {
        const iconCandidates = new Set<string>;
        iconCandidates.add(className);
        iconCandidates.add(className.replace(/\s+/g, "-"));
        iconCandidates.add(className.replace(/\s+/g, "_"));
        iconCandidates.add(className.replace(/-/g, "_"));
        iconCandidates.add(className.replace(/_/g, "-"));
        iconCandidates.add(className.replace(/\./g, "-"));
        iconCandidates.add(className.split(".")[0]);
        iconCandidates.add(className.split("-")[0]);
        iconCandidates.add(className.split("_")[0]);

        return [...iconCandidates].filter(name => name.length > 0);
    }

    private findFromGtk(initialClass: string) {
        const className = initialClass.toLowerCase().trim();
        const iconCandidates = this.getIconCandidates(className);
        const icon = iconCandidates.find(iconName => this.iconTheme.has_icon(iconName));
        if(icon) {
            this.iconMap.set(initialClass, icon);
            return icon;
        }
    }

    public findIcon(initialClass: string): string {
        return this.iconMap.get(initialClass) ?? this.findFromGtk(initialClass) ?? this.findDesktopEntry(initialClass) ?? "application-x-executable";
    }

    public saveIconNames() {
        const toSave = JSON.stringify([...this.iconMap.entries()], null, 2);
        writeFile(path, toSave);
    }
}

const iconFinder = new IconFinderClass;

export default iconFinder;
