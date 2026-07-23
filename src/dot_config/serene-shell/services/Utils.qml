pragma Singleton

import QtQuick
import Quickshell

Singleton {
    id: root

    function formatSeconds(seconds) {
        if (!seconds || seconds <= 0) return "00:00"

        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        const pad = n => String(n).padStart(2, '0')

        return hrs > 0
            ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
            : `${pad(mins)}:${pad(secs)}`
    }

    function limitString(str, max) {
        if (str.length <= max) return str;
        const cut = str.slice(0, max);
        const lastSpace = cut.lastIndexOf(" ");
        return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "...";
    }
}