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
                    implicitWidth: Metrics.iconS * (modelData.active ? 1.5 : 1)
                    radius: Metrics.radiusFull
                    color: modelData.active ? Colors.md3.primary : Colors.md3.surface_variant

                    StyledText {
                        anchors.centerIn: parent
                        text: modelData.name
                        font.bold: true
                        color: modelData.active ? Colors.md3.surface_variant : Colors.md3.outline
                    }

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
