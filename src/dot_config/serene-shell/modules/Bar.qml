//@ pragma UseQApplication
import Quickshell
import Quickshell.Widgets
import QtQuick
import QtQuick.Layouts

import qs.components
import qs.styles

PanelWindow {
    id: root
    screen: modelData
    required property QtObject modelData

    anchors {
        top: true
        left: true
        right: true
    }

    implicitHeight: Metrics.barHeight

    margins {
        left: Metrics.paddingS
        right: Metrics.paddingS
    }
    
    color: "transparent"

    StyledRect {
        id: barContent
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.verticalCenter: parent.verticalCenter
        radius: Metrics.radiusL
        color: Colors.md3.surface

        implicitHeight: Math.max(leftRow.implicitHeight, centerRow.implicitHeight, rightRow.implicitHeight)
            + Metrics.paddingS * 2

        RowLayout {
            id: leftRow
            anchors.left: parent.left
            anchors.leftMargin: Metrics.paddingM
            anchors.verticalCenter: parent.verticalCenter
            spacing: Metrics.paddingM

            SystemTray { rootBar: root }
        }

        RowLayout {
            id: centerRow
            anchors.centerIn: parent
            spacing: Metrics.paddingM

            Workspaces { rootBar: root }
        }

        RowLayout {
            id: rightRow
            anchors.right: parent.right
            anchors.rightMargin: Metrics.paddingM
            anchors.verticalCenter: parent.verticalCenter
            spacing: Metrics.paddingM

            MainPlayer {}
            Time {}
            Audio {}
            Battery {}
        }
    }
}