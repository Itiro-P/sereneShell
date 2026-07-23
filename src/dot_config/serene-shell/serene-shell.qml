//@ pragma UseQApplication

import Quickshell
import Quickshell.Io
import QtQuick

import qs.modules
import qs.services

ShellRoot {
    id: root
    settings.watchFiles: true

    IpcHandler {
        target: "launcher"

        function toggle() {
            States.launcherOpen ^= 1
        }
    }

    IpcHandler {
        target: "logout"

        function toggle() {
            States.logoutOpen ^= 1
        }
    }

    IpcHandler {
        target: "mpris"

        function previous() {
            Mpris.previous()
        }

        function togglePlaying() {
            Mpris.togglePlaying()
        }


        function next() {
            Mpris.next()
        }
    }

    IpcHandler {
        target: "stasis"

        function pause() {
            Stasis.pause()
        }

        function resume() {
            Stasis.resume()
        }
    }


    Variants {
        model: Quickshell.screens

        Bar {}
    }
    Osd {}
    Launcher {}
    Logout {}
    Notifications {}
}