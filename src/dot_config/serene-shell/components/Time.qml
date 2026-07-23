import Quickshell
import QtQuick
import QtQuick.Layouts
import Quickshell.Widgets

import qs.services

WrapperItem {
    id: root

    Text {
        text: `${Clock.time} ${Clock.date}`
    }
}