pragma Singleton

import Quickshell
import QtQuick

Singleton {
    id: root

    function lock() {
        Quickshell.execDetached(["sh", "-c", "qs -p ~/.config/serene-shell/serene-locker.qml"])
    }

    function poweroff() {
        Quickshell.execDetached(["sh", "-c", "systemctl poweroff || loginctl poweroff"])
    }

    function reboot() {
        Quickshell.execDetached(["sh", "-c", "systemctl reboot || loginctl reboot"])
    }

    function suspend() {
        Quickshell.execDetached(["sh", "-c", "systemctl suspend || loginctl suspend"])
    }

    function hibernate() {
        Quickshell.execDetached(["sh", "-c", "systemctl hibernate || loginctl hibernate"])
    }

    function logout() {
        Quickshell.execDetached(["loginctl", "terminate-user", Quickshell.env("USER")])
    }
}