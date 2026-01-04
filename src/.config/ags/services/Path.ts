import GLib from "gi://GLib?version=2.0";

class PathClass {
    private _rootDir: string;
    private _stylesDir: string;
    private _jsonsDir: string;

    public constructor() {
        this._rootDir = GLib.get_home_dir() + "/.config/ags";
        this._stylesDir = this._rootDir + "/styles";
        this._jsonsDir = this._rootDir + "/jsons";
    }

    public get rootDir() {
        return this._rootDir;
    }

    public get stylesDir() {
        return this._stylesDir;
    }

    public get jsonsDir() {
        return this._jsonsDir;
    }
}

export const pathService = new PathClass;
