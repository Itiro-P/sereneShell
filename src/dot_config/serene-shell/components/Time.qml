import Quickshell
import QtQuick
import QtQuick.Layouts
import Quickshell.Widgets

import qs.services
import qs.styles

WrapperItem {
    id: root

    StyledText {
        font.pixelSize: Metrics.fontM
        text: `${Clock.time} ${Clock.date}`
    }
}