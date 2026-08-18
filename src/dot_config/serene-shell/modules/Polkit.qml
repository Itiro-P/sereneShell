import Quickshell
import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell.Wayland

import qs.services
import qs.styles

LazyLoader {
    id: loader
    active: PolkitService.isActive

    property bool authFailed: false

    PanelWindow {
        id: polkitWindow
        WlrLayershell.layer: WlrLayer.Overlay
        color: "transparent"
        exclusionMode: ExclusionMode.Ignore
        aboveWindows: true
        focusable: true

        anchors {
            top: true
            bottom: true
            left: true
            right: true
        }

        MouseArea {
            anchors.fill: parent
            onClicked: {
                if (PolkitService.currentFlow) PolkitService.currentFlow.cancelAuthenticationRequest()
            }
        }

        Shortcut {
            sequence: "Escape"
            onActivated: {
                if (PolkitService.currentFlow) PolkitService.currentFlow.cancelAuthenticationRequest()
            }
        }

        Rectangle {
            id: content
            radius: Metrics.radiusL * 2
            anchors.centerIn: parent
            color: Colors.md3.surface

            implicitHeight: contentColumn.implicitHeight + Metrics.spacingM * 2
            implicitWidth: contentColumn.implicitWidth + Metrics.spacingM * 2

            MouseArea {
                anchors.fill: parent
                onClicked: {}
            }

            ColumnLayout {
                id: contentColumn
                anchors.fill: parent
                anchors.margins: 18
                spacing: 12

                Item { Layout.fillHeight: true }

                Label {
                    Layout.fillWidth: true
                    text: PolkitService.currentFlow?.message || "<no message>"
                    wrapMode: Text.Wrap
                    font.bold: true
                }

                Label {
                    Layout.fillWidth: true
                    text: PolkitService.currentFlow?.supplementaryMessage || "<no supplementary message>"
                    wrapMode: Text.Wrap
                    opacity: 0.8
                    color: PolkitService.currentFlow?.supplementaryIsError ? "red" : contentColumn.palette.text
                }

                Label {
                    Layout.fillWidth: true
                    text: PolkitService.currentFlow?.inputPrompt || "<no input prompt>"
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "Authentication failed, try again"
                    color: "red"
                    visible: loader.authFailed
                }

                TextField {
                    id: passwordInput
                    echoMode: PolkitService.currentFlow?.responseVisible ? TextInput.Normal : TextInput.Password
                    selectByMouse: true
                    Layout.fillWidth: true
                    onAccepted: okButton.clicked()
                }

                RowLayout {
                    spacing: 8
                    Button {
                        id: okButton
                        text: "OK"
                        enabled: passwordInput.text.length > 0 || !!PolkitService.currentFlow?.isResponseRequired
                        onClicked: {
                            PolkitService.currentFlow.submit(passwordInput.text)
                            passwordInput.text = ""
                            passwordInput.forceActiveFocus()
                        }
                    }
                    Button {
                        text: "Cancel"
                        visible: PolkitService.isActive
                        onClicked: {
                            if (PolkitService.currentFlow) {
                                PolkitService.currentFlow.cancelAuthenticationRequest()
                            }
                            passwordInput.text = ""
                        }
                    }
                }

                Item { Layout.fillHeight: true }
            }

            Connections {
                target: PolkitService.currentFlow

                function onAuthenticationFailed() {
                    loader.authFailed = true
                    passwordInput.text = ""
                    passwordInput.forceActiveFocus()
                }

                function onIsResponseRequiredChanged() {
                    passwordInput.text = ""
                    if (PolkitService.currentFlow.isResponseRequired)
                        passwordInput.forceActiveFocus()
                }
            }

            Connections {
                target: PolkitService
                function onIsActiveChanged() {
                    if (PolkitService.isActive)
                        loader.authFailed = false
                }
            }

            Component.onCompleted: passwordInput.forceActiveFocus()
        }
    }
}
