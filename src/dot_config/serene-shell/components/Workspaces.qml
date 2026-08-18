import Quickshell
import QtQuick
import QtQuick.Layouts
import Quickshell.Widgets
import Quickshell.WindowManager

import qs.styles

WrapperRectangle {
    id: root
    required property QtObject rootBar
    readonly property var workspaces: WindowManager.screenProjection(rootBar.screen).windowsets
    color: "transparent"

    RowLayout {
        anchors.fill: parent
        spacing: Metrics.spacingS

        Repeater {
            model: root.workspaces
            delegate: WrapperMouseArea {
                cursorShape: Qt.PointingHandCursor
                onClicked: modelData.activate()
                Rectangle {
                    implicitHeight: Metrics.iconS
                    implicitWidth: Metrics.iconS * (modelData.active ? 1.6 : 1)
                    radius: Metrics.radiusFull
                    color: modelData.active ? Colors.md3.primary : Colors.md3.surface_variant

                    Behavior on implicitWidth {
                        NumberAnimation { duration: 200; easing.type: Easing.OutCubic }
                    }
                }
            }
            
            /*
            Workspace {
                workspace: modelData
                rootBar: root.rootBar
            }
            */
        }
    }
}