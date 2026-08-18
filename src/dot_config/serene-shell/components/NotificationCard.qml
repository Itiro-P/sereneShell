import Quickshell
import Quickshell.Widgets
import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell.Services.Notifications

import qs.styles

Rectangle {
    id: root
    required property var modelData
    property real progressValue: 100

    Layout.fillWidth: true
    implicitHeight: content.implicitHeight + Metrics.paddingM * 2
    radius: Metrics.radiusL
    color: Colors.md3.surface
    border.width: 2
    border.color: switch (modelData.urgency) {
        case NotificationUrgency.Low:
            return Colors.md3.secondary;
        case NotificationUrgency.Critical:
            return Colors.md3.error;
        default:
            return Colors.md3.primary;
    }

    NumberAnimation {
        target: root
        property: "progressValue"
        from: 100
        to: 0
        duration: 4000
        running: modelData.urgency !== NotificationUrgency.Critical
        onFinished: modelData.dismiss()
    }

    ColumnLayout {
        id: content
        anchors.fill: parent
        anchors.margins: Metrics.paddingM
        spacing: Metrics.spacingS

        RowLayout {
            id: layout
            Layout.fillWidth: true
            spacing: Metrics.spacingS

            Image {
                Layout.preferredWidth: 36
                Layout.preferredHeight: 36
                Layout.alignment: Qt.AlignCenter
                fillMode: Image.PreserveAspectFit
                visible: source.toString() !== ""
                source: modelData.image || modelData.appIcon || ""
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: Metrics.spacingS

                RowLayout {
                    Layout.fillWidth: true
                    spacing: Metrics.spacingS

                    StyledText {
                        font.pixelSize: Metrics.fontM
                        Layout.fillWidth: true
                        font.bold: true
                        text: modelData.summary
                        elide: Text.ElideRight
                    }

                    Button {
                        id: dismissButton
                        implicitWidth: 18
                        implicitHeight: 18
                        padding: 0

                        onClicked: modelData.dismiss()

                        background: Rectangle {
                            radius: Metrics.radiusFull
                            color: dismissButton.down
                                ? Colors.md3.surface_container_highest
                                : dismissButton.hovered
                                    ? Colors.md3.surface_container_high
                                    : "transparent"

                            Behavior on color {
                                ColorAnimation { duration: 120 }
                            }
                        }

                        contentItem: IconImage {
                            source: Quickshell.iconPath("window-close-symbolic")
                            implicitSize: Metrics.fontS
                        }
                    }
                }

                StyledText {
                    font.pixelSize: Metrics.fontM
                    Layout.fillWidth: true
                    visible: text !== ""
                    text: modelData.body
                    wrapMode: Text.WordWrap
                }
            }
        }

        RowLayout {
            spacing: Metrics.spacingS
            visible: modelData.actions.length > 0

            Repeater {
                model: modelData.actions

                delegate: StyledRect {
                    id: actionRect
                    required property NotificationAction modelData

                    Layout.fillWidth: true
                    implicitHeight: actionContent.implicitHeight + Metrics.spacingS * 2
                    radius: Metrics.radiusM
                    color: Colors.md3.surface_container
                    border.width: 1
                    border.color: actionMouseArea.containsMouse
                        ? Colors.md3.primary
                        : Colors.md3.outline_variant

                    Behavior on border.color {
                        ColorAnimation { duration: 120 }
                    }

                    WrapperMouseArea {
                        id: actionMouseArea
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: actionRect.modelData.invoke()
                        RowLayout {
                            id: actionContent
                            anchors.fill: parent
                            anchors.margins: Metrics.spacingM
                            spacing: Metrics.spacingS

                            Image {
                                source: modelData.hasActionIcons ? actionRect.modelData.identifier : ""
                                Layout.maximumWidth: Metrics.iconS
                                Layout.maximumHeight: Metrics.iconS
                                visible: modelData.hasActionIcons ?? false
                            }

                            StyledText {
                                Layout.fillWidth: true
                                Layout.alignment: Qt.AlignCenter
                                text: actionRect.modelData.text
                                color: actionMouseArea.containsMouse
                                    ? Colors.md3.primary
                                    : Colors.md3.on_surface
                                horizontalAlignment: Text.AlignHCenter
                                verticalAlignment: Text.AlignVCenter
                                wrapMode: Text.Wrap
                            }
                        }
                    }
                }
            }
        }

        StyledRect {
            Layout.fillWidth: true
            visible: modelData.hasInlineReply
            implicitHeight: Metrics.fontM + Metrics.spacingM * 2
            radius: Metrics.radiusM
            color: Colors.md3.surface_container
            border.width: 1
            border.color: Colors.md3.outline_variant

            TextField {
                id: notificationInlineReplyTextField
                anchors.fill: parent
                anchors.rightMargin: Metrics.fontM + Metrics.spacingM * 2
                anchors.margins: Metrics.spacingS
                background: null
                color: Colors.md3.on_surface
                placeholderTextColor: Colors.md3.on_surface_variant
                font.pixelSize: Metrics.fontM
                placeholderText: modelData.inlineReplyPlaceholder
                verticalAlignment: Text.AlignVCenter
                wrapMode: Text.Wrap
            }

            WrapperMouseArea {
                id: notificationInlineReplyMouseArea
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: notification.modelData.sendInlineReply(notificationInlineReplyTextField.text)

                margin: Metrics.spacingS

                anchors {
                    right: parent.right
                    rightMargin: Metrics.spacingS
                    verticalCenter: parent.verticalCenter
                }
                
                IconImage {
                    anchors.centerIn: parent
                    source: Quickshell.iconPath("mail-send-symbolic")
                    implicitSize: Metrics.fontM
                }
            }
        }
    }
}