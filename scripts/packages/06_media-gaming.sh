#!/usr/bin/env bash
set -euo pipefail

echo "Instalando ferramentas para jogos e multimídia."

yay -S --needed --noconfirm \
    pipewire pipewire-alsa pipewire-jack pipewire-pulse wireplumber \
    gst-libav gst-plugin-pipewire \
    obs-studio cava clapper \
    gamemode lib32-gamemode \
    steam heroic-games-launcher-bin gamescope \
    mangohud lib32-mangohud mangojuice
