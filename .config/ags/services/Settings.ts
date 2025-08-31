import GLib from "gi://GLib?version=2.0";
import cava, { CavaVisiblity } from "../modules/Cava";
import { readFile, writeFile } from "ags/file";
import animationService from "./Animations";
import dateTime from "../modules/DateTime";
import wallpaperSelector from "../modules/WallpaperSelector";

interface Options {
    animationsEnabled: boolean;
    dtcVisible: boolean;
    cavaVisible: CavaVisiblity;
    wallpaperSelectorActive: boolean;
}

const optionsFallback: Options = {
    animationsEnabled: true,
    dtcVisible: true,
    cavaVisible: CavaVisiblity.ALWAYS,
    wallpaperSelectorActive: true
}

const path = GLib.get_home_dir() + '/.config/ags/options/options.json';

class SettingsClass {
    private _options: Options;

    constructor() {
        this._options = this.readPath();
    }

    private readPath() {
        const fileStr = readFile(path);
        const res =  fileStr.length > 0 ? JSON.parse(fileStr) as Options : optionsFallback;
        let toReturn: Options = {
            animationsEnabled: res.animationsEnabled ?? optionsFallback.animationsEnabled,
            dtcVisible: res.dtcVisible ?? optionsFallback.dtcVisible,
            cavaVisible: res.cavaVisible ?? optionsFallback.cavaVisible,
            wallpaperSelectorActive: res.wallpaperSelectorActive ?? optionsFallback.wallpaperSelectorActive
        };
        animationService.setAnimationsEnabled = toReturn.animationsEnabled;
        dateTime.setIsDTCvisible = toReturn.dtcVisible;
        cava.setVisibilityState = toReturn.cavaVisible;
        wallpaperSelector.setTimerActive = toReturn.wallpaperSelectorActive;

        return toReturn;
    }

    public saveOptions() {
        this._options = {
            animationsEnabled: animationService.animationsEnabled.get(),
            dtcVisible: dateTime.isDTCvisible.get(),
            cavaVisible: cava.visibilityState.get(),
            wallpaperSelectorActive: wallpaperSelector.timerActive.get()
        }
        writeFile(path, JSON.stringify(this._options, null, 2));
    }

    public get options() {
        return this._options;
    }
}

const settingsService = new SettingsClass;

export default settingsService;
