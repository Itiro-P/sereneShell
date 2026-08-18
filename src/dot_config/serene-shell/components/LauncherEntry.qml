import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell
import Quickshell.Widgets

import qs.services
import qs.styles

WrapperRectangle {
    required property var modelData
    width: resultsList.width
    radius: Metrics.radiusL
    margin: Metrics.paddingS
    
    color: ListView.isCurrentItem ? Colors.md3.secondary_container : "transparent"

    WrapperMouseArea {
        cursorShape: Qt.PointingHandCursor
        onClicked: {
            States.launcherOpen = false
            modelData.execute()
        }
        RowLayout {
            spacing: Metrics.spacingM

            IconImage {
                implicitWidth: Metrics.iconM
                implicitHeight: Metrics.iconM
                source: Quickshell.iconPath(modelData.icon, true)
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0

                StyledText {
                    text: modelData.name
                    color: Colors.md3.on_surface
                    font.pixelSize: Metrics.fontM
                }

                StyledText {
                    visible: !!modelData.comment
                    text: modelData.comment
                    color: Colors.md3.on_surface_variant
                    font.pixelSize: Metrics.fontS
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }
            }
        }
    }
}