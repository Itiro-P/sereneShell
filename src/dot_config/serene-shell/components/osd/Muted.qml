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

        WrapperItem {
            Text {
                anchors {
                    left: parent.left
                    top: parent.top
                    bottom: parent.bottom
                }
                text: OsdSignals.message
                color: "white"
            }
        }
    }
}