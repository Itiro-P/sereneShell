import Quickshell
import QtQuick
import QtQuick.Layouts
import Quickshell.Services.Notifications

Rectangle {
    id: root
    required property var modelData

    Layout.fillWidth: true
    implicitHeight: 120
    radius: 8
    color: "blue"
    border.width: 2

    Timer {
        running: modelData.urgency !== NotificationUrgency.Critical
        interval: 4000
        onTriggered: modelData.dismiss()
    }

    RowLayout {
        id: layout

        anchors.fill: parent
        anchors.margins: 10
        spacing: 10

        Image {
            Layout.preferredWidth: 36
            Layout.preferredHeight: 36
            Layout.alignment: Qt.AlignTop
            fillMode: Image.PreserveAspectFit
            visible: source.toString() !== ""
            source: modelData.image || modelData.appIcon || ""
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 2
            
            Text {
                Layout.fillWidth: true
                text: modelData.summary
                font.bold: true
                elide: Text.ElideRight
            }

            Text {
                Layout.fillWidth: true
                visible: text !== ""
                text: modelData.body
                wrapMode: Text.WordWrap
            }
        }
    }

    MouseArea {
        anchors.fill: parent
        onClicked: modelData.dismiss()
    }
}