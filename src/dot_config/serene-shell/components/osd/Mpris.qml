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
            source: OsdSignals.iconName
        }

        WrapperItem {
            Text {
                text: OsdSignals.message
                color: "white"
            }
        }
    }
}