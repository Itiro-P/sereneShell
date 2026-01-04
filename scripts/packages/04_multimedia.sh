#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes de multimídia."

yay -S --needed --noconfirm \
    cava \
    clapper \
    obs-studio \
    pipewire \
    pipewire-alsa \
    pipewire-jack \
    pipewire-pulse \
    wireplumber \
    libpulse \
    pavucontrol \
    overskride \
    gst-libav \
    gst-plugin-pipewire \
    glycin \
    glycin-gtk4 \
    pear-desktop
