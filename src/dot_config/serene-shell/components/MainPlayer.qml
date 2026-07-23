import QtQuick
import Quickshell
import QtQuick.Layouts
import Quickshell.Widgets

import qs.services

WrapperItem {
    id: root
    visible: Mpris.player != null

    RowLayout {
        Text {
            text: `${Utils.limitString(Mpris.title, 20)} - ${Utils.limitString(Mpris.artist, 20)} ${Utils.formatSeconds(Mpris.position)}/${Utils.formatSeconds(Mpris.length)}`
        }

        WrapperMouseArea {
            IconImage {
                implicitWidth: 16
                implicitHeight: 16
                source: "image://icon/media-skip-backward-symbolic"
            }
            cursorShape: Qt.PointingHandCursor
            onClicked: Mpris.previous()
        }

        WrapperMouseArea {
            IconImage {
                implicitWidth: 16
                implicitHeight: 16
                source: `image://icon/${Mpris.player?.isPlaying ? "media-playback-pause-symbolic": "media-playback-start-symbolic"}`
            }
            cursorShape: Qt.PointingHandCursor
            onClicked: Mpris.togglePlaying()
        }

        WrapperMouseArea {
            IconImage {
                implicitWidth: 16
                implicitHeight: 16
                source: "image://icon/media-skip-forward-symbolic"
            }
            cursorShape: Qt.PointingHandCursor
            onClicked: Mpris.next()
        }
    }
}