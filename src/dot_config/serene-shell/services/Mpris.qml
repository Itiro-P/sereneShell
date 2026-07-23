pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Services.Mpris

import qs.services

Singleton {
    id: root

    readonly property MprisPlayer player: Mpris.players.values.find(
        p => p?.isPlaying || p.playbackState === MprisPlaybackState.Paused
    ) ?? null

    readonly property string title: player?.trackTitle || "Unknown Title"
    readonly property string artist: player?.trackArtist || "Unknown Artist"
    readonly property real position: player?.position ?? 0
    readonly property real length: player?.length ?? 0

    FrameAnimation {
        running: player?.isPlaying || false
        onTriggered: player.positionChanged()
    }

    function previous() {
        if (player?.canGoPrevious ?? false) {
            player.previous()
        }
    }

    function togglePlaying() {
        if (player?.canTogglePlaying ?? false) player.togglePlaying()
    }

    function next() {
        if (player?.canGoNext ?? false) {
            player.next()
        }
    }

    Connections {
        target: player

        function onPlaybackStateChanged() {
            if (!player) return;
            OsdSignals.show(
                OsdSignals.Kind.Mpris, 
                `image://icon/${player.isPlaying ? "media-playback-pause-symbolic": "media-playback-start-symbolic"}`,
                0,
                `${Utils.limitString(title, 32)} - ${Utils.limitString(artist, 32)}`
            );
        }

        function onPostTrackChanged() {
            if (!player) return;
            OsdSignals.show(
                OsdSignals.Kind.Mpris, 
                "image://icon/media-playback-pause-symbolic",
                0,
                `${Utils.limitString(title, 32)} - ${Utils.limitString(artist, 32)}`
            );
        }
    }
}