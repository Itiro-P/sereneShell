import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell
import Quickshell.Widgets
import Quickshell.Wayland
import QtQuick.Effects

import qs.services
import qs.styles

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

        WlrLayershell.layer: WlrLayer.Overlay
        color: "transparent"
        aboveWindows: true
        focusable: true
        exclusionMode: ExclusionMode.Ignore

        MouseArea {
            anchors.fill: parent
            onClicked: States.logoutOpen = false
        }

        Shortcut {
            sequence: "Escape"
            onActivated: States.logoutOpen = false
        }

        Rectangle {
            id: content
            radius: Metrics.radiusL * 2
            anchors.centerIn: parent
            color: Colors.md3.surface
            
            implicitHeight: contentColumn.implicitHeight + Metrics.spacingM * 2
            implicitWidth: contentColumn.implicitWidth + Metrics.spacingM * 2

            component ActionButton: Button {
                property string iconName: ""
                implicitWidth: Metrics.buttonHeight * 4
                implicitHeight: Metrics.buttonHeight * 4

                background: Rectangle {
                    radius: Metrics.radiusFull
                    color: parent.activeFocus ? Colors.md3.primary : Colors.md3.primary_fixed
                    border.width: parent.activeFocus ? 2 : 0
                    border.color: Colors.md3.on_primary
                }

                contentItem: Item {
                    IconImage {
                        id: icon
                        width: Metrics.iconL * 4
                        height: Metrics.iconL * 4
                        anchors.centerIn: parent
                        source: Quickshell.iconPath(iconName)
                        visible: false
                    }

                    MultiEffect {
                        anchors.fill: icon
                        source: icon
                        colorization: 1.0
                        colorizationColor: parent.activeFocus ? Colors.md3.on_primary : Colors.md3.on_primary_fixed
                    }
                }
            }

            MouseArea {
                anchors.fill: parent
                onClicked: {}
            }

            ColumnLayout {
                id: contentColumn
                anchors.centerIn: parent
                spacing: Metrics.spacingXl

                RowLayout {
                    spacing: Metrics.spacingXl

                    ActionButton {
                        id: btnLock
                        iconName: "system-lock-screen-symbolic"
                        onClicked: {
                            LogoutCommands.lock()
                            States.logoutOpen = false
                        }
                        Keys.onReturnPressed: {
                            LogoutCommands.lock()
                            States.logoutOpen = false
                        }
                        KeyNavigation.right: btnLogout
                        KeyNavigation.down: btnHibernate
                    }
                    ActionButton {
                        id: btnLogout
                        iconName: "system-log-out-symbolic"
                        onClicked: {
                            LogoutCommands.logout()
                            States.logoutOpen = false
                        }
                        Keys.onReturnPressed: {
                            LogoutCommands.logout()
                            States.logoutOpen = false
                        }
                        KeyNavigation.left: btnLock
                        KeyNavigation.right: btnSuspend
                        KeyNavigation.down: btnShutdown
                    }
                    ActionButton {
                        id: btnSuspend
                        iconName: "system-suspend-symbolic"
                        onClicked: {
                            LogoutCommands.suspend()
                            States.logoutOpen = false
                        }
                        Keys.onReturnPressed: {
                            LogoutCommands.suspend()
                            States.logoutOpen = false
                        }
                        KeyNavigation.left: btnLogout
                        KeyNavigation.down: btnReboot
                    }
                }

                RowLayout {
                    spacing: Metrics.spacingXl

                    ActionButton {
                        id: btnHibernate
                        iconName: "system-hibernate-symbolic"
                        onClicked: {
                            LogoutCommands.hibernate()
                            States.logoutOpen = false
                        }
                        Keys.onReturnPressed: {
                            LogoutCommands.hibernate()
                            States.logoutOpen = false
                        }
                        KeyNavigation.right: btnShutdown
                        KeyNavigation.up: btnLock
                    }
                    ActionButton {
                        id: btnShutdown
                        iconName: "system-shutdown-symbolic"
                        onClicked: {
                            LogoutCommands.poweroff()
                            States.logoutOpen = false
                        }
                        Keys.onReturnPressed: {
                            LogoutCommands.poweroff()
                            States.logoutOpen = false
                        }
                        KeyNavigation.left: btnHibernate
                        KeyNavigation.right: btnReboot
                        KeyNavigation.up: btnLogout
                    }
                    ActionButton {
                        id: btnReboot
                        iconName: "system-reboot-symbolic"
                        onClicked: {
                            LogoutCommands.reboot()
                            States.logoutOpen = false
                        }
                        Keys.onReturnPressed: {
                            LogoutCommands.reboot()
                            States.logoutOpen = false
                        }
                        KeyNavigation.left: btnShutdown
                        KeyNavigation.up: btnSuspend
                    }
                }
            }
        }
        Component.onCompleted: btnLock.forceActiveFocus()
    }
}