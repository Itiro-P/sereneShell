import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell
import Quickshell.Widgets
import Quickshell.Wayland

import qs.services

LazyLoader {
    active: States.logoutOpen

    PanelWindow {
        id: logoutWindow
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
            propagateComposedEvents: false 
            Keys.onPressed: event => {
                if (event.key === Qt.Key_Escape) States.logoutOpen = false;
            }

            onClicked: {
                States.logoutOpen = false;
            }

            Rectangle {
                id: content
                radius: height / 12
                anchors.centerIn: parent
                color: "#1e1f29"

                component ActionButton: Button {
                    property string iconName: ""
                    implicitWidth: 56
                    implicitHeight: 56
                    display: AbstractButton.IconOnly

                    icon.name: iconName
                    icon.width: 28
                    icon.height: 28

                    background: Rectangle {
                        radius: 8
                        color: parent.activeFocus ? "#3a3f5a" : "transparent"
                        border.width: parent.activeFocus ? 2 : 0
                        border.color: "#7aa2f7"
                    }
                }

                ColumnLayout {
                    anchors.centerIn: parent
                    spacing: 12

                    RowLayout {
                        ActionButton {
                            id: btnLock
                            iconName: "system-lock-screen-symbolic"
                            onClicked: Quickshell.execDetached(["loginctl", "lock-session"])
                            KeyNavigation.right: btnLogout
                            KeyNavigation.down: btnHibernate
                        }
                        ActionButton {
                            id: btnLogout
                            iconName: "system-log-out-symbolic"
                            onClicked: Quickshell.execDetached(["loginctl", "terminate-user", Quickshell.env("USER")])
                            KeyNavigation.left: btnLock
                            KeyNavigation.right: btnSuspend
                            KeyNavigation.down: btnShutdown
                        }
                        ActionButton {
                            id: btnSuspend
                            iconName: "system-suspend-symbolic"
                            onClicked: Quickshell.execDetached(["sh", "-c", "systemctl suspend || loginctl suspend"])
                            KeyNavigation.left: btnLogout
                            KeyNavigation.down: btnReboot
                        }
                    }

                    RowLayout {
                        ActionButton {
                            id: btnHibernate
                            iconName: "system-hibernate-symbolic"
                            onClicked: Quickshell.execDetached(["sh", "-c", "systemctl hibernate || loginctl hibernate"])
                            KeyNavigation.right: btnShutdown
                            KeyNavigation.up: btnLock
                        }
                        ActionButton {
                            id: btnShutdown
                            iconName: "system-shutdown-symbolic"
                            onClicked: Quickshell.execDetached(["sh", "-c", "systemctl poweroff || loginctl poweroff"])
                            KeyNavigation.left: btnHibernate
                            KeyNavigation.right: btnReboot
                            KeyNavigation.up: btnLogout
                        }
                        ActionButton {
                            id: btnReboot
                            iconName: "system-reboot-symbolic"
                            onClicked: Quickshell.execDetached(["sh", "-c", "systemctl reboot || loginctl reboot"])
                            KeyNavigation.left: btnShutdown
                            KeyNavigation.up: btnSuspend
                        }
                    }
                }
            }
            Component.onCompleted: btnLock.forceActiveFocus()
        }
    }
}