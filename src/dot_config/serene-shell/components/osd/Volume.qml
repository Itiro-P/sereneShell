import QtQuick
import QtQuick.Layouts
import Quickshell
import Quickshell.Widgets

import qs.services

WrapperItem {
    id: root
    RowLayout {
        spacing: 8
        anchors {
            fill: parent
            leftMargin: 8
            rightMargin: 16
        }

        IconImage {
            implicitSize: 32
            source: Quickshell.iconPath(OsdSignals.iconName)
        }

        Rectangle {
            Layout.fillWidth: true
            implicitHeight: 12
            radius: 24
            color: "#50ffffff"

            Rectangle {
                anchors {
                    left: parent.left
                    top: parent.top
                    bottom: parent.bottom
                }

                implicitWidth: parent.width * OsdSignals.value
                radius: parent.radius
                color: "white"
            }
        }
    }
}