export namespace Swww {

    export interface ParserOptions {

    }

    export enum Command {
        CLEAR = 'clear',
        RESTORE = 'restore',
        CLEAR_CACHE = 'clear-cache',
        IMG = 'img',
        KILL = 'kill',
        QUERY = 'query'
    }

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

    export function parseCommand(options: Partial<ParserOptions>): string {
        let res = 'swww ';
        return res;
    }
}
