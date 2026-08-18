#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes de multimídia."

yay -S --needed --noconfirm \
    cava \
    obs-studio \
    pipewire-alsa \
    pipewire-pulse \
    alsa-utils \
    gst-libav \
    gst-plugin-pipewire \
    gst-plugins-bad \
    gst-plugins-good \
    gst-plugins-ugly \
    glycin-gtk4 \
    pear-desktop \
    komikku