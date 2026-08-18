import Quickshell
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Effects
import Quickshell.Services.UPower
import Quickshell.Widgets

import qs.styles
import qs.services

Rectangle {
    id: root
    implicitWidth: contentRow.implicitWidth + Metrics.spacingS
    implicitHeight: contentRow.implicitHeight + Metrics.spacingXs
    color: Colors.md3.on_primary
    radius: Metrics.radiusL
    clip: true

    property UPowerDevice battery: UPower.displayDevice
    property bool onBattery: UPower.onBattery
    readonly property string timeToEmpty: battery.state != UPowerDeviceState.Charging ? Utils.formatSeconds(battery.timeToEmpty) : ""
    readonly property string timeToFull: battery.state != UPowerDeviceState.Discharging ? Utils.formatSeconds(battery.timeToFull) : ""
    readonly property string batteryState: battery.state == UPowerDeviceState.FullyCharged ? "Full" : timeToEmpty.length > 0 ? timeToEmpty : timeToFull

    readonly property string stateIconName: {
        switch (battery.state) {
            case UPowerDeviceState.Charging: return "battery-charging-symbolic"
            case UPowerDeviceState.FullyCharged: return "battery-full-charged-symbolic"
            case UPowerDeviceState.PendingCharge: return "battery-charging-symbolic"
            case UPowerDeviceState.PendingDischarge: return "battery-good-symbolic"
            default: return ""
        }
    }
    readonly property string percentageStr: `${Math.round(battery.percentage * 100)}%`

    // componente reutilizável: ícone + texto, sem cor própria
    component BatteryContent: Row {
        id: rowRoot
        spacing: 4

        IconImage {
            visible: root.stateIconName.length > 0
            source: root.stateIconName.length > 0 ? Quickshell.iconPath(root.stateIconName, true) : ""
            implicitSize: Metrics.iconS
            anchors.verticalCenter: parent.verticalCenter
        }

        Text {
            anchors.verticalCenter: parent.verticalCenter
            text: root.percentageStr
            font.pixelSize: Metrics.fontS
            font.bold: true
        }
    }

    BatteryContent {
        id: contentRow
        anchors.centerIn: parent
        layer.enabled: true
        layer.effect: MultiEffect {
            colorization: 1.0
            colorizationColor: Colors.md3.primary
        }
    }

    Rectangle {
        id: fillRect
        anchors {
            left: parent.left
            top: parent.top
            bottom: parent.bottom
        }
        width: root.width * battery.percentage
        radius: root.radius
        color: Colors.md3.primary

        BatteryContent {
            x: contentRow.x - fillRect.x
            y: contentRow.y - fillRect.y
            layer.enabled: true
            layer.effect: MultiEffect {
                colorization: 1.0
                colorizationColor: Colors.md3.on_primary
            }
        }
    }
}