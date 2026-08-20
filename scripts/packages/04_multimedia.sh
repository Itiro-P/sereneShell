#!/usr/bin/env bash
set -euo pipefail
echo "Instalando pacotes de multimídia."
yay -S --needed --noconfirm \
    cava \
    obs-studio \
    mpv \
    mpvqt \
    vlc \
    haruna \
    pipewire \
    pipewire-alsa \
    pipewire-pulse \
    pipewire-jack \
    wireplumber \
    libpulse \
    alsa-utils \
    gst-libav \
    gst-plugin-pipewire \
    gst-plugins-bad \
    gst-plugins-good \
    gst-plugins-ugly \
    glycin-gtk4 \
    pear-desktop \
    komikku