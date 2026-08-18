pragma Singleton

import Quickshell
import Quickshell.Services.Polkit

Singleton {
    id: root

    PolkitAgent {
        id: agent
    }

    readonly property alias isActive: agent.isActive
    readonly property alias isRegistered: agent.isRegistered
    readonly property alias currentFlow: agent.flow
}