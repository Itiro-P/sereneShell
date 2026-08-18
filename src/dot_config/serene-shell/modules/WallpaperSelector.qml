import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell
import Quickshell.Widgets
import Quickshell.Wayland
import QtQuick.Effects

import qs.services
import qs.components
import qs.styles

LazyLoader {
    active: States.wallpaperSelectorOpen

    PanelWindow {
        id: selectorWIndow
        WlrLayershell.layer: WlrLayer.Overlay

        anchors {
            top: true
            bottom: true
            left: true
            right: true
        }

        color: "transparent"
        aboveWindows: true 
        focusable: true

        MouseArea {
            anchors.fill: parent
            onClicked: States.wallpaperSelectorOpen = false
        }

        Shortcut {
            sequence: "Escape"
            onActivated: States.wallpaperSelectorOpen = false
        }

    Rectangle {
        anchors.bottom: parent.bottom
        anchors.horizontalCenter: parent.horizontalCenter
        color: Colors.md3.surface
        implicitHeight: Metrics.imagePreviewHeight + (Metrics.paddingS * 2)
        implicitWidth: Metrics.imagePreviewWidth * 5 + Metrics.paddingL
        radius: Metrics.radiusL

        MouseArea {
            anchors.fill: parent
            onClicked: {}
        }

        RowLayout {
            anchors.fill: parent
            anchors.margins: Metrics.paddingS
            
            ListView {
                id: resultsList
                Layout.fillWidth: true
                Layout.preferredHeight: Metrics.imagePreviewHeight
                orientation: ListView.Horizontal
                spacing: Metrics.spacingS
                clip: true
                model: Awww.wallpapers
                keyNavigationEnabled: true
                Keys.onReturnPressed: {
                    if (currentItem) {
                        States.wallpaperSelectorOpen = false
                        Awww.apply(screen.name, currentItem.modelData.filePath)
                    }
                }
                delegate: WallpaperPreview { output: screen.name }
            }
        }
    }
    }
}