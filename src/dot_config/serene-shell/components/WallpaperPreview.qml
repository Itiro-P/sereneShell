import Quickshell
import Quickshell.Widgets
import QtQuick
import QtQuick.Controls

import qs.services
import qs.styles

ClippingRectangle {
    id: root
    required property var modelData
    required property var output

    implicitWidth: Metrics.imagePreviewWidth
    implicitHeight: Metrics.imagePreviewHeight
    radius: Metrics.radiusM
    border {
        width: Metrics.borderThin
        color: Colors.md3.primary
    }

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: Awww.apply(output, modelData.filePath)
    }

    Image {
        anchors.fill: parent
        source: modelData.filePath
        fillMode: Image.PreserveAspectCrop
        asynchronous: true
        cache: true
    }
}
