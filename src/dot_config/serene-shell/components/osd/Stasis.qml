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

        Item {
            Layout.alignment: Qt.AlignHCenter
            implicitWidth: osdText.implicitHeight
            implicitHeight: osdText.implicitWidth

            StyledText {
                id: osdText
                anchors.centerIn: parent
                text: OsdSignals.message
                font.pixelSize: Metrics.fontL
                rotation: 90
            }
        }
    }
}