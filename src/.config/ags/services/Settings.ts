import { readFile, writeFileAsync } from "ags/file";
import { Accessor, createState, Setter } from "ags";
import { pathService } from "./Path";

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

class SettingsClass {
    private _animationsEnabled: Accessor<boolean>;
    private _setAnimationsEnabled: Setter<boolean>;
    private _cavaVisible: Accessor<boolean>;
    private _setCavaVisible: Setter<boolean>;
    private _wallpaperSelectorActive: Accessor<boolean>;
    private _setWallpaperSelectorActive: Setter<boolean>;
    private _stasisEnabled: Accessor<boolean>;
    private _setStatisEnabled: Setter<boolean>;

    constructor() {
        try {
            const fileStr = readFile(pathService.jsonsDir + "/options.json");
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
        [this._stasisEnabled, this._setStatisEnabled] = createState(true);
    }

    public saveOptions() {
        const options = {
            animationsEnabled: this._animationsEnabled.peek(),
            cavaVisible: this._cavaVisible.peek(),
            wallpaperSelectorActive: this._wallpaperSelectorActive.peek()
        }
        writeFileAsync(pathService.jsonsDir + "/options.json", JSON.stringify(options, null, 2)).catch(err => console.log(err));
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

    public get stasisEnabled() {
        return this._stasisEnabled;
    }

    public set setWallpaperSelectorActive(newState: boolean) {
        if(this._wallpaperSelectorActive.peek() !== newState) this._setWallpaperSelectorActive(newState);
    }

    public set setAnimationsEnabled(newState: boolean) {
        if (this._animationsEnabled.peek() !== newState) this._setAnimationsEnabled(newState);
    }

    public set setCavaVisible(newState: boolean) {
        if(this._cavaVisible.peek() !== newState) this._setCavaVisible(newState);
    }

    public set setStasisEnabled(newState: boolean) {
        if(this._stasisEnabled.peek() !== newState) this._setStatisEnabled(newState);
    }
}

export const settingsService = new SettingsClass;
