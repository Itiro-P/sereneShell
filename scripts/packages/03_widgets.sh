#!/usr/bin/env bash
set -euo pipefail

echo "Instalando widgets e utilitários."

yay -S --needed --noconfirm \
    libastal-meta \
    libastal-niri-git \
    rofi \
    mako \
    brightnessctl \
    wlsunset \
    playerctl \
    swayosd \
    grim \
    slurp \
    wl-mirror \
    wev