import QtQuick
import QtQuick.Layouts
import Quickshell
import Quickshell.Widgets
import Quickshell.Wayland

import qs.services
import qs.components.osd
import qs.styles

LazyLoader {
    id: root
    active: OsdSignals.visible

    PanelWindow {
        WlrLayershell.layer: WlrLayer.Overlay
        anchors {
            left: true
        }
        exclusiveZone: 0

        implicitWidth: wrapper.implicitWidth
        implicitHeight: wrapper.implicitHeight

        color: "transparent"
        mask: Region {}

        WrapperItem {
            id: wrapper

            StyledRect {
                id: styledRect
                radius: Metrics.radiusL * 2

                implicitWidth: stack.currentItem ? stack.currentItem.implicitWidth + Metrics.paddingL : 60
                implicitHeight: stack.currentItem ? stack.currentItem.implicitHeight + Metrics.paddingL : 240

                StackLayout {
                    id: stack
                    anchors.fill: parent
                    currentIndex: OsdSignals.kind

                    readonly property Item currentItem: children[currentIndex]

                    Volume {}
                    Muted {}
                    Stasis {}
                }
            }
        }
    }
}