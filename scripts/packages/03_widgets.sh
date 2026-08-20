#!/usr/bin/env bash
set -euo pipefail
echo "Instalando widgets e utilitários."
yay -S --needed --noconfirm \
    grim \
    slurp \
    wl-mirror \
    wl-clipboard \
    quickshell \
    stasis \
    playerctl \
    brightnessctl \
    wlsunset \
    wev \
    network-manager-applet \
    pavucontrol-qt