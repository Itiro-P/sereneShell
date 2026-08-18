import Quickshell
import QtQuick
import QtQuick.Layouts
import Quickshell.Widgets
import Quickshell.Wayland
import Quickshell.WindowManager

import qs.styles

WrapperRectangle {
    id: root
    required property QtObject rootBar
    required property var workspace
    
    color: Colors.md3.surface_variant
    radius: Metrics.radiusL

    ScriptModel {
        id: clients
        values: ToplevelManager.toplevels.values.filter(w => w.parent == null && w.screens.includes(rootBar.screen))
    }

    RowLayout {
        spacing: Metrics.spacingS

        Repeater {
            model: clients
            delegate: WrapperMouseArea {
                cursorShape: Qt.PointingHandCursor
                onClicked: modelData.activate()

                IconImage {
                    source: Quickshell.iconPath(DesktopEntries.heuristicLookup(modelData.appId)?.icon ?? "applications-other-symbolic")
                    implicitWidth: Metrics.iconS
                    implicitHeight: Metrics.iconS
                }
            }
        }
    }
}