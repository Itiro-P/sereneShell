import QtQuick
import Quickshell
import QtQuick.Layouts
import Quickshell.Widgets

import qs.services
import qs.styles

Item {
    id: root
    visible: Mpris.player != null
    
    implicitWidth: row.implicitWidth
    implicitHeight: row.implicitHeight



    RowLayout {
        id: row
        anchors.centerIn: parent
        spacing: Metrics.spacingS

        WrapperMouseArea {
            IconImage {
                implicitWidth: 16
                implicitHeight: 16
                source: Quickshell.iconPath("media-skip-backward-symbolic")
            }
            cursorShape: Qt.PointingHandCursor
            onClicked: Mpris.previous()
        }

        WrapperMouseArea {
            RowLayout {
                anchors.fill: parent
                spacing: Metrics.spacingS

                IconImage {
                    implicitWidth: 16
                    implicitHeight: 16
                    source: Quickshell.iconPath(Mpris.player?.isPlaying ? "media-playback-pause-symbolic": "media-playback-start-symbolic")
                }
                StyledText {
                    font.pixelSize: Metrics.fontM
                    text: `${Utils.limitString(Mpris.title, 20)} - ${Utils.limitString(Mpris.artist, 20)}`
                }
            }
            cursorShape: Qt.PointingHandCursor
            onClicked: Mpris.togglePlaying()
        }

        WrapperMouseArea {
            IconImage {
                implicitWidth: 16
                implicitHeight: 16
                source: Quickshell.iconPath("media-skip-forward-symbolic")
            }
            cursorShape: Qt.PointingHandCursor
            onClicked: Mpris.next()
        }
    }
}