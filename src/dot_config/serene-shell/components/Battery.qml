import Quickshell
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell.Services.UPower
import Quickshell.Widgets

WrapperItem {
    id: root

    property UPowerDevice battery: UPower.displayDevice
    property bool onBattery: UPower.onBattery

    RowLayout {
        IconImage {
            implicitWidth: 16
            implicitHeight: 16
            source: "image://icon/" + battery.iconName
        }

        Text {
            text: `${Math.round(battery.percentage * 100)}%`
        }
    }
}