import QtQuick
import QtQuick.Layouts
import Quickshell
import Quickshell.Widgets

import qs.services
import qs.styles

WrapperItem {
    id: root

    topMargin: Metrics.paddingM
    bottomMargin: Metrics.paddingM

    ColumnLayout {
        spacing: Metrics.spacingS

        IconImage {
            implicitSize: Metrics.iconL
            Layout.alignment: Qt.AlignHCenter
            source: Quickshell.iconPath(OsdSignals.iconName)
        }
        
        Text {
            text: `${Math.round(OsdSignals.value * 100)}%`
            font.pixelSize: Metrics.fontS
            font.bold: true
            color: Colors.md3.primary
            Layout.alignment: Qt.AlignHCenter
        }
        Rectangle {
            implicitWidth: 12
            implicitHeight: 200
            radius: Metrics.radiusL
            color: Colors.md3.on_primary
            Layout.alignment: Qt.AlignHCenter

            Rectangle {
                anchors {
                    left: parent.left
                    bottom: parent.bottom
                    right: parent.right
                }

                implicitHeight: parent.height * OsdSignals.value
                radius: parent.radius
                color: Colors.md3.primary
            }
        }
    }
}