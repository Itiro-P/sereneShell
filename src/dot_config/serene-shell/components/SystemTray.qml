import Quickshell
import Quickshell.Io
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell.Services.SystemTray
import Quickshell.Widgets

RowLayout {
    id: root
    required property QtObject rootBar

    Repeater {
        model: SystemTray.items
        delegate: MouseArea {
            id: trayItem

            required property SystemTrayItem modelData

            cursorShape: Qt.PointingHandCursor
            acceptedButtons: Qt.LeftButton | Qt.RightButton
            hoverEnabled: true
            implicitWidth: 24
            implicitHeight: 24

            onClicked: mouse => {
                if (mouse.button === Qt.LeftButton) {
                    modelData.activate();
                } else if (mouse.button === Qt.RightButton) {
                    if (modelData.hasMenu) {
                        modelData.display(rootBar, 0, 0);
                    } else {
                        modelData.secondaryActivate();
                    }
                }
            }

            //ToolTip.visible: containsMouse
            //ToolTip.delay: Application.styleHints.mousePressAndHoldInterval
            //ToolTip.text: modelData.tooltipTitle || modelData.title || ""

            IconImage {
                anchors.centerIn: parent
                implicitWidth: 16
                implicitHeight: 16
                source: modelData.icon ?? ""
            }
        }
    }
}