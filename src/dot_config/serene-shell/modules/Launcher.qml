import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell
import Quickshell.Widgets
import Quickshell.Wayland

import qs.services
import qs.styles
import qs.components

LazyLoader {
    active: States.launcherOpen

    PanelWindow {
        id: launcherWindow
        WlrLayershell.layer: WlrLayer.Overlay

        anchors {
            top: true
            bottom: true
            left: true
            right: true
        }

        color: "transparent"
        aboveWindows: true
        focusable: true
        exclusionMode: ExclusionMode.Ignore
        property string query: ""

        readonly property var allApps: {
            return [...DesktopEntries.applications.values]
                .filter(d => d.name)
                .sort((a, b) => a.name.localeCompare(b.name));
        }

        ScriptModel {
            id: filtered
            values: {
                const q = query?.trim().toLowerCase() ?? "";
                if (q === "") return allApps;

                const scored = [];
                for (const d of allApps) {
                    const name = (d.name || "").toLowerCase();
                    const comment = (d.comment || "").toLowerCase();
                    const keywords = (d.keywords || []).join(" ").toLowerCase();
                    const categories = (d.categories || []).join(" ").toLowerCase();

                    let score = -1;
                    if (name.startsWith(q)) score = 0;
                    else if (name.includes(q)) score = 1;
                    else if (keywords.includes(q)) score = 2;
                    else if (comment.includes(q)) score = 3;
                    else if (categories.includes(q)) score = 4;

                    if (score >= 0) scored.push({ entry: d, score });
                }

                scored.sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name));
                return scored.map(s => s.entry);
            }
        }

        Shortcut {
            sequence: "Escape"
            onActivated: States.launcherOpen = false
        }

        MouseArea {
            anchors.fill: parent
            onClicked: States.launcherOpen = false
        }

        Rectangle {
            id: card
            anchors.centerIn: parent
            implicitHeight: 400
            implicitWidth: 400
            radius: Metrics.radiusL
            color: Colors.md3.surface
            border.width: 1
            border.color: Colors.md3.on_primary_container

            MouseArea {
                anchors.fill: parent
                onClicked: {}
            }

            ColumnLayout {
                spacing: Metrics.spacingS
                anchors.fill: parent
                anchors.margins: Metrics.paddingM

                TextField {
                    id: searchField
                    Layout.fillWidth: true
                    placeholderText: "Buscar aplicativo..."
                    onTextChanged: {
                        query = text;
                        resultsList.currentIndex = 0; 
                    }

                    font.pixelSize: Metrics.fontM
                    color: Colors.md3.on_surface

                    background: Rectangle {
                        radius: Metrics.radiusM
                        color: Colors.md3.surface_variant
                    }

                    Keys.onDownPressed: {
                        if (resultsList.count > 0) {
                            if (resultsList.currentIndex < 0)
                                resultsList.currentIndex = 0;
                            resultsList.forceActiveFocus();
                        }
                    }
                    Keys.onReturnPressed: {
                        if (resultsList.count > 0) {
                            const first = filtered.values[0];
                            if (first) {
                                States.launcherOpen = false;
                                first.execute();
                            }
                        }
                    }
                }

                ListView {
                    id: resultsList
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    clip: true
                    model: filtered
                    keyNavigationEnabled: true
                    spacing: Metrics.spacingXs
                    
                    Keys.onPressed: event => {
                        switch (event.key) {
                            case Qt.Key_Up:
                            case Qt.Key_Down:
                            case Qt.Key_Return:
                            case Qt.Key_Enter:
                            case Qt.Key_Escape:
                            case Qt.Key_Control:
                            case Qt.Key_Shift:
                            case Qt.Key_Alt:
                            case Qt.Key_Meta:
                            case Qt.Key_AltGr:
                            case Qt.Key_CapsLock:
                                return;
                            default:
                                searchField.forceActiveFocus();
                                if (event.text.length > 0) {
                                    resultsList.currentIndex = 0;
                                    searchField.text += event.text;
                                    searchField.cursorPosition = searchField.text.length;
                                }
                                event.accepted = true;
                        }
                    }

                    Keys.onReturnPressed: {
                        const item = currentItem;
                        if (item && item.modelData) {
                            States.launcherOpen = false;
                            item.modelData.execute();
                        }
                    }

                    delegate: LauncherEntry {}
                }
            }
            Component.onCompleted: searchField.forceActiveFocus()
        }
    }
}
