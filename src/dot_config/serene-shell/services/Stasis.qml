pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
  	id: root

    property bool paused: false

    Process {
        running: true
        command: ["stasis"]
    }

    function pause() {
        paused = true
        Quickshell.execDetached(["stasis", "pause"])
    }

    function resume() {
        paused = false
        Quickshell.execDetached(["stasis", "resume"])
    }
}