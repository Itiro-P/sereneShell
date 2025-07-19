export function formatTime(seconds: number): string {
    if (!seconds || seconds < 0) return "0:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

export function formatTimeVerbose(seconds: number): string {
    if(seconds >= 3600) {
        return `${Math.floor(seconds / 3600)}h${Math.floor((seconds % 3600) / 60)}m`;
    }

    return `${Math.floor(seconds / 60)}m`;
}
