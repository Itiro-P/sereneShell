pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Services.Pipewire

import qs.services

Singleton {
    id: root

    enum Kind {
        Volume,
        Muted,
        Mpris, 
        Stasis
    }

    property bool visible: false
    property int kind: OsdSignals.Kind.Volume
    property real value: 0
    property string iconName: ""
    property string message: ""

    function show(newKind, newIcon, newValue, newMsg) {
        kind = newKind;
        value = newValue;
        iconName = newIcon;
        message = newMsg;
        visible = true;
        hideTimer.restart();
    }

    Timer {
        id: hideTimer
        interval: 2000
        onTriggered: visible = false
    }


    PwObjectTracker {
        objects: [
            Pipewire.defaultAudioSink, 
            Pipewire.defaultAudioSource
        ]
    }

    Connections {
        target: Pipewire.defaultAudioSink?.audio || null

        function onVolumeChanged() {
            let audio = Pipewire.defaultAudioSink.audio
            let vol = audio.volume
            let icon = (audio.muted || vol === 0) ? "audio-volume-muted-symbolic" : "audio-volume-high-symbolic"
            show(OsdSignals.Kind.Volume, icon, vol, "")
        }

        function onMutedChanged() {
            let audio = Pipewire.defaultAudioSink.audio
            let isMuted = audio.muted
            let vol = isMuted ? 0 : audio.volume
            let icon = isMuted ? "audio-volume-muted-symbolic" : "audio-volume-high-symbolic"
            show(OsdSignals.Kind.Muted, icon, vol, `Saída ${isMuted ? "sem" : "com"} áudio`)
        }
    }

    Connections {
        target: Pipewire.defaultAudioSource?.audio || null

        function onVolumeChanged() {
            let audio = Pipewire.defaultAudioSource.audio
            let vol = audio.volume
            let icon = (audio.muted || vol === 0) ? "mic-volume-muted-symbolic" : "mic-volume-high-symbolic"
            show(OsdSignals.Kind.Volume, icon, vol, "")
        }

        function onMutedChanged() {
            let audio = Pipewire.defaultAudioSource.audio
            let isMuted = audio.muted
            let vol = isMuted ? 0 : audio.volume
            let icon = isMuted ? "mic-volume-muted-symbolic" : "mic-volume-high-symbolic"
            show(OsdSignals.Kind.Muted, icon, vol, `Entrada ${isMuted ? "sem" : "com"} áudio`)
        }
    }

    Connections {
        target: Stasis

        function onPausedChanged() {
            let isPaused = Stasis.paused
            show(OsdSignals.Kind.Stasis, "clock-applet-symbolic", 0, `Inatividade ${isPaused ? "des" : ""}ativada`)
        }
    }
}