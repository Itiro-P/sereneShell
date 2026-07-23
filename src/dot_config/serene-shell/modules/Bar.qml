//@ pragma UseQApplication
import Quickshell
import QtQuick
import QtQuick.Layouts

import qs.components

PanelWindow {
    id: root
    screen: modelData
    required property QtObject modelData

    anchors {
        top: true
        left: true
        right: true
    }

    implicitHeight: 24

    Item {
        anchors.fill: parent

        RowLayout {
            id: leftContent
            anchors.left: parent.left
            anchors.verticalCenter: parent.verticalCenter

            SystemTray { rootBar: root }
        }

        RowLayout {
            id: centerContent
            anchors.centerIn: parent
            
            Workspaces { rootBar: root }
        }

        RowLayout {
            id: rightContent
            anchors.right: parent.right
            anchors.verticalCenter: parent.verticalCenter

            MainPlayer {}
            Time {}
            Audio {}
            Battery {}
        }
    }
}