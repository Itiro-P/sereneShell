pragma Singleton

import Quickshell
import QtQuick
import Qt.labs.folderlistmodel

Singleton {
    id: root

    readonly property int tick: 0
    readonly property string wallpapersPath: `file://${Quickshell.env("HOME")}/.config/serene-shell/wallpapers`
    readonly property string matugenPath: `${Quickshell.env("HOME")}/.config/matugen/config.toml`

    readonly property alias wallpapers: folderModel

    FolderListModel {
        id: folderModel
        folder: wallpapersPath

        showDirs: false
        
        nameFilters: ["*.png", "*.jpg", "*.jpeg", "*.webp", "*.gif"]

    }
    
    function restore() {
        Quickshell.execDetached(["awww", "restore"])
    }

    function apply(output = "eDP-1", path = "") {
        if(path == "") return
        Quickshell.execDetached(["awww", "img", path, "-o", output])
        
        Quickshell.execDetached({
            command: ["matugen", "image", path, "--source-color-index", "0"],
            workingDirectory: `${Quickshell.env("HOME")}/.config/matugen`
        })
    }
}
