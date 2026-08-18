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
        keepOnReload: false
        bodySupported: true
        persistenceSupported: false
        actionsSupported: true
        imageSupported: true
        actionIconsSupported: true
        inlineReplySupported: true

        onNotification: n => n.tracked = true
    }
}