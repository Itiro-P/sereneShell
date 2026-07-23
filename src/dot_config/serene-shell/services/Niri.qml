pragma Singleton

import Quickshell
import QtQuick
import Niri
import QtQml.Models

Singleton {
    id: root

    Niri {
        id: niri
        Component.onCompleted: connect()
        onErrorOccurred: error => console.error("Niri IPC error:", error)
    }

    readonly property alias workspaces: niri.workspaces
    readonly property alias windows: niri.windows
    readonly property alias focusedWindow: niri.focusedWindow

    // Cria um proxy filtrado por output, um por tela
    function workspacesForOutput(output) {
        return workspaceProxyComponent.createObject(root, { output: output });
    }

    // Cria um proxy filtrado por workspace, um por card de preview
    function windowsForWorkspace(workspaceId) {
        return windowProxyComponent.createObject(root, { workspaceId: workspaceId });
    }

    property Component workspaceProxyComponent: Component {
        SortFilterProxyModel {
            id: proxy
            property string output: ""
            sourceModel: niri.workspaces
            filters: ValueFilter {
                roleName: "output"
                value: proxy.output
            }
        }
    }

    property Component windowProxyComponent: Component {
        SortFilterProxyModel {
            id: proxy
            property var workspaceId: null
            sourceModel: niri.windows
            filters: ValueFilter {
                roleName: "workspaceId"
                value: proxy.workspaceId
            }
        }
    }

    function focusWorkspace(id) { return niri.focusWorkspaceById(id); }
    function focusWindow(id) { return niri.focusWindow(id); }
    function closeWindow(id) { return niri.closeWindow(id); }
}