pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Services.Notifications

Singleton {
    id: root

    readonly property string a: "b"
    property alias trackedNotifications: server.trackedNotifications

    NotificationServer {
        id: server
        bodySupported: true
        keepOnReload: false
        persistenceSupported: false
        actionsSupported: true
        imageSupported: true
        actionIconsSupported: true

        onNotification: n => n.tracked = true
    }
}