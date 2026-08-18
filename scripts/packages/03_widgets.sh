#!/usr/bin/env bash
set -euo pipefail

echo "Instalando widgets e utilitários."

yay -S --needed --noconfirm \
    grim \
    slurp \
    wl-mirror \
    quickshell \
    qml-niri \
    wev \
    network-manager-applet \
    pavucontrol-qt