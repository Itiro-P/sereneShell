import QtQuick
import QtQuick.Layouts
import Quickshell
import Quickshell.Widgets

import qs.services
import qs.components.osd

LazyLoader {
    id: root
    active: OsdSignals.visible

    PanelWindow {
        anchors.bottom: true
        margins.bottom: screen.height / 5
        exclusiveZone: 0

        implicitWidth: 240
        implicitHeight: 60
        color: "transparent"

        mask: Region {}

        Rectangle {
            anchors.fill: parent
            radius: height / 2
            color: "#80000000"

            StackLayout {
                anchors.fill: parent
                currentIndex: OsdSignals.kind
                
                Volume {}
                Muted {}
                Mpris {}
                Stasis {}
            }
        }
    }
}