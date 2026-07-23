import QtQuick
import Quickshell
import QtQuick.Layouts

import qs.services
import qs.components

LazyLoader {
    id: root
    active: true

    PanelWindow {
        anchors {
            top: true
            right: true
        }
        margins {
            top: 12
            right: 12
        }
        exclusiveZone: 0
        implicitWidth: 380
        implicitHeight: Math.max(1, column.implicitHeight)
        color: "transparent"

        ColumnLayout {
            id: column
            width: parent.width
            spacing: 10

            Repeater {
                model: NotificationsService.trackedNotifications
                NotificationCard {}
            }
        }
    }
}