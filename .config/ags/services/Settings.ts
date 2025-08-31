import GLib from "gi://GLib?version=2.0";
import { readFile, writeFile } from "ags/file";
import { Accessor, createState, Setter } from "ags";

interface Options {
    animationsEnabled: boolean;
    cavaVisible: boolean;
    wallpaperSelectorActive: boolean;
}

const optionsFallback: Options = {
    animationsEnabled: true,
    cavaVisible: true,
    wallpaperSelectorActive: true
}

const path = GLib.get_home_dir() + '/.config/ags/options/options.json';

class SettingsClass {
    private _animationsEnabled: Accessor<boolean>;
    private _setAnimationsEnabled: Setter<boolean>;
    private _cavaVisible: Accessor<boolean>;
    private _setCavaVisible: Setter<boolean>;
    private _wallpaperSelectorActive: Accessor<boolean>;
    private _setWallpaperSelectorActive: Setter<boolean>;

    constructor() {
        const fileStr = readFile(path);
        try {
            const parsed = JSON.parse(fileStr) as Options;
            [this._animationsEnabled, this._setAnimationsEnabled] = createState(parsed.animationsEnabled);
            [this._cavaVisible, this._setCavaVisible] = createState(parsed.cavaVisible);
            [this._wallpaperSelectorActive, this._setWallpaperSelectorActive] = createState(parsed.wallpaperSelectorActive);

        } catch(err) {
            console.error('Erro ao ler options.json: ' + err);
            [this._animationsEnabled, this._setAnimationsEnabled] = createState(optionsFallback.animationsEnabled);
            [this._cavaVisible, this._setCavaVisible] = createState(optionsFallback.cavaVisible);
            [this._wallpaperSelectorActive, this._setWallpaperSelectorActive] = createState(optionsFallback.wallpaperSelectorActive);
        }
    }

    public saveOptions() {
        const options = {
            animationsEnabled: this._animationsEnabled.get(),
            cavaVisible: this._cavaVisible.get(),
            wallpaperSelectorActive: this._wallpaperSelectorActive.get()
        }
        writeFile(path, JSON.stringify(options, null, 2));
    }

    public get animationsEnabled() {
        return this._animationsEnabled;
    }

    public get cavaVisible() {
        return this._cavaVisible;
    }

    public get wallpaperSelectorActive() {
        return this._wallpaperSelectorActive;
    }

    public set setWallpaperSelectorActive(newState: boolean) {
        if(this._wallpaperSelectorActive.get() !== newState) this._setWallpaperSelectorActive(newState);
    }

    public set setAnimationsEnabled(newState: boolean) {
        if(this._animationsEnabled.get() !== newState) this._setAnimationsEnabled(newState);
    }

    public set setCavaVisible(newState: boolean) {
        if(this._cavaVisible.get() !== newState) this._setCavaVisible(newState);
    }
}

const settingsService = new SettingsClass;

export default settingsService;
