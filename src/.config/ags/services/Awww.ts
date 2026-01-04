import app from "ags/gtk4/app";
import { execAsync } from "ags/process";
import { pathService } from "./Path";

export namespace Awww {
    export enum Resize {
        NO = 'no',
        CROP = 'crop',
        FIT = 'fit',
        STRETCH = 'stretch'
    }

    export enum Filter {
        NEAREST = 'Nearest',
        BILINEAR = 'Bilinear',
        CATMULLROM = 'CatmullRom',
        MITCHELL = 'Mitchell',
        LANCZOS3 = 'Lanczos3'
    }

    export enum TransitionType {
        NONE = 'none',
        SIMPLE = 'simple',
        FADE = 'fade',
        LEFT = 'left',
        RIGHT = 'right',
        TOP = 'top',
        BOTTOM = 'bottom',
        WIPE = 'wipe',
        WAVE = 'wave',
        GROW = 'grow',
        CENTER = 'center',
        ANY = 'any',
        RANDOM = 'random'
    }

    export enum TransitionPos {
        CENTER = 'center',
        TOP = 'top',
        LEFT = 'left',
        RIGHT = 'right',
        BOTTOM = 'bottom',
        TOP_LEFT = 'top-left',
        TOP_RIGHT = 'top-right',
        BOTTOM_LEFT = 'bottom-left',
        BOTTOM_RIGHT = 'bottom-right'
    }


    export interface ParserOptions {
        resize: Resize;
        filter: Filter;
        transitionType: TransitionType;
        transitionPos: TransitionPos;
        outputs: string;
        transitionStep: number;
        transitionDurantion: number;
        transitionAngle: number;
        invertY: boolean;
        transitionWave: { x: number, y: number };
    }


    class Manager {

        constructor() {
        }

        public async checkLastWallpaper(connector: string): Promise<string | null> {
            try {
                const out = await execAsync("awww query --json");
                const data = JSON.parse(out);

                const monitor = (data[""] ?? []).find((m: any) => m.name === connector);
                return monitor?.displaying?.image || null;
            } catch (error) {
                console.error("Failed to get wallpaper:", error);
                return null;
            }
        }

        public async setWallpaper(path: string, options: Partial<ParserOptions>): Promise<boolean> {
            if (!path) return false;

            let command = `awww img "${path}"`;

            if (options.resize) command += ` --resize ${options.resize}`;
            if (options.filter) command += ` -f ${options.filter}`;
            if (options.invertY === true) command += ` --invert-y`;
            if (options.transitionAngle) command += ` --transition-angle ${options.transitionAngle}`;
            if (options.transitionDurantion) command += ` --transition-duration ${options.transitionDurantion}`;
            if (options.transitionPos) command += ` --transition-pos ${options.transitionPos}`;
            if (options.transitionStep) command += ` --transition-step ${options.transitionStep}`;
            if (options.transitionType) command += ` --transition-type ${options.transitionType}`;
            if (options.transitionWave)
                command += ` --transition-wave ${options.transitionWave.x},${options.transitionWave.y}`;
            if (options.outputs) command += ` --outputs ${options.outputs}`;

            try {
                await Promise.all([
                    execAsync(`matugen image "${path}"`),
                    execAsync(command),
                ]);
                await execAsync(`sass ${pathService.stylesDir}/index.scss ${pathService.stylesDir}/output.css`).then(
                    () => {
                        app.apply_css(`${pathService.stylesDir}/output.css`, true);
                    }
                );
                return true;
            } catch (error) {
                console.warn("Failed to process:", error, `\n${command}`);
                return false;
            }
        }
    }
    export const manager = new Manager;
}
