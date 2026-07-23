import Quickshell
import QtQuick
import QtQuick.Layouts
import Quickshell.Widgets

import qs.services

WrapperItem {
    id: root
    required property QtObject rootBar
    readonly property var workspaces: Niri.workspacesForOutput(rootBar.screen.name)

    RowLayout {
        id: workspaceRow
        spacing: 4

        Repeater {
            model: workspaces
            delegate: Rectangle {
                required property var modelData
                property bool expand: modelData.isFocused

                implicitWidth: 16
                implicitHeight: 16
                radius: 8
                color: modelData.isFocused ? "#106DAA" : modelData.isActive ? "#377B86" : "#222225"
                border.color: modelData.isUrgent ? "red" : "transparent"
                border.width: 2

                Text {
                    visible: !expand
                    anchors.centerIn: parent
                    text: modelData.name || modelData.index
                    color: modelData.isFocused || modelData.isActive ? "white" : "#89919A"
                    font.pixelSize: 11
                }

                Repeater {
                    visible: expand
                    anchors.centerIn: parent

                    model: Niri.windowsForWorkspace(modelData.index)
                    delegate: Rectangle {
                        color: model.isFocused ? "lightblue" : "white"

                        Text {
                            text: model.title + " (" + model.appId + ")"
                        }

                        MouseArea {
                            anchors.fill: parent
                            acceptedButtons: Qt.LeftButton | Qt.RightButton
                            onClicked: function(mouseEvent) {
                                if (mouseEvent.button === Qt.LeftButton) {
                                    Niri.focusWindow(model.id)
                                } else {
                                    Niri.closeWindow(model.id)
                                }
                            }
                        }
                    }
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: Niri.focusWorkspace(modelData.id)
                }
            }
        }
    }
}