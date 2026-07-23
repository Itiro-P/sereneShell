import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell
import Quickshell.Widgets

import qs.services

LazyLoader {
    active: States.launcherOpen

    PanelWindow {
        id: launcherWindow

        anchors {
            top: true
            bottom: true
            left: true
            right: true
        }

        color: "transparent"
        aboveWindows: true 
        focusable: true
        property string query: ""

        ScriptModel {
            id: filtered
            values: {
                const all = [...DesktopEntries.applications.values]
                    .filter(d => d.name)
                    .sort((a, b) => a.name.localeCompare(b.name));

                const q = query?.trim().toLowerCase() ?? "";
                if (q === "") return all;

                return all.filter(d => {
                    const name = (d.name || "").toLowerCase();
                    const comment = (d.comment || "").toLowerCase();
                    const keywords = (d.keywords || []).join(" ").toLowerCase();
                    const categories = (d.categories || []).join(" ").toLowerCase();
                    return name.includes(q) || comment.includes(q)
                        || keywords.includes(q) || categories.includes(q);
                });
            }
        }

        MouseArea {
            anchors.fill: parent
            propagateComposedEvents: false 
            Keys.onPressed: event => {
                let key = event.key
                switch (key) {
                    case Qt.Key_Control:
                    case Qt.Key_Shift:
                    case Qt.Key_Alt:
                    case Qt.Key_Meta:
                    case Qt.Key_AltGr:
                    case Qt.Key_CapsLock:
                    case Qt.Key_Up:
                    case Qt.Key_Down:
                    case Qt.Key_PageUp:
                    case Qt.Key_PageDown:
                        return;
                    case Qt.Key_9:
                    case Qt.Key_3:
                        if (event.modifiers() & Qt.KeypadModifier)
                            return;
                    case Qt.Key_Escape:
                        States.launcherOpen = false
                        return;
                    default:
                        searchField.forceActiveFocus()
                }                
            }

            onClicked: {
                States.launcherOpen = false;
            }

            Rectangle {
                anchors.centerIn: parent
                implicitHeight: 400
                implicitWidth: 400

                ColumnLayout {
                    spacing: 8
                    anchors.fill: parent
                    TextField {
                        id: searchField
                        Layout.fillWidth: true
                        placeholderText: "Buscar aplicativo..."
                        onTextChanged: query = text

                        Keys.onDownPressed: {
                            if (resultsList.count > 0) {
                                resultsList.forceActiveFocus();
                            }
                        }
                        Keys.onReturnPressed: {
                            if (resultsList.count > 0) {
                                filtered.values[0].execute();
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

                        delegate: Rectangle {
                            required property var modelData
                            width: resultsList.width
                            height: 48
                            radius: 6
                            color: ListView.isCurrentItem ? "#3a3f5a" : "transparent"

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 8
                                spacing: 12

                                IconImage {
                                    implicitWidth: 32
                                    implicitHeight: 32
                                    source: Quickshell.iconPath(modelData.icon, true)
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 0

                                    Text {
                                        text: modelData.name
                                        color: "white"
                                        font.pixelSize: 14
                                    }

                                    Text {
                                        visible: !!modelData.comment
                                        text: modelData.comment
                                        color: "#888"
                                        font.pixelSize: 11
                                        elide: Text.ElideRight
                                        Layout.fillWidth: true
                                    }
                                }
                            }

                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: modelData.execute()
                            }
                        }

                        Keys.onReturnPressed: {
                            if (currentItem) {
                                currentItem.modelData.execute();
                                States.launcherOpen = false;
                            }
                        }
                    }
                }
                Component.onCompleted: searchField.forceActiveFocus()
            }
        }
    }
}