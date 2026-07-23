pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
    id: root

    Process {
        running: true
        command: ["awww-daemon"]
    }

    function restore() {
        Quickshell.execDetached(["awww", "restore"])
    }

    function img(output = "eDP-1", path = "") {
        if(path == "") return

        Quickshell.execDetached(["awww", "-o", output, path])
    }
}