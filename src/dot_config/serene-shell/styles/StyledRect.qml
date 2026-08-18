import QtQuick
import Quickshell
import Quickshell.Widgets

ClippingRectangle {
    id: root
    color: Colors.md3.surface
    radius: Metrics.radiusM

    Behavior on implicitWidth {
        NumberAnimation { duration: 200; easing.type: Easing.OutCubic }
    }

    Behavior on implicitHeight {
        NumberAnimation { duration: 200; easing.type: Easing.OutCubic }
    }
}