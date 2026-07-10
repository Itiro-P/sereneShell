#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes da sessão Wayland."

yay -S --needed --noconfirm \
    niri \
    niri-focused-booster \
    gamescope \
    xdg-desktop-portal-gnome \
    xwayland-satellite \
    frameworkintegration \
    layer-shell-qt \
    libportal-gtk4 \
    xdg-user-dirs \
    shikane
