import QtQuick
import Quickshell
import QtQuick.Controls

import qs.services
import qs.styles

Button {
    id: root

    padding: 10
    focusPolicy: Qt.NoFocus

    background: Rectangle {
        radius: Metrics.radiusM
        color: root.down
            ? Colors.md3.primary_container
            : root.hovered
                ? Colors.md3.primary_fixed_dim
                : Colors.md3.primary
        border.color: Colors.md3.outline
        border.width: root.down || root.hovered ? 0 : 1

        Behavior on color {
            ColorAnimation { duration: 100 }
        }
    }

    contentItem: StyledText {
        text: root.text
        color: root.enabled ? Colors.md3.on_primary : Colors.md3.outline_variant
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
    }
}