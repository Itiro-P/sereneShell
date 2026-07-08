#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes da sessão Wayland."

yay -S --needed --noconfirm \
    niri \
    niri-focused-booster \
    gamescope \
    greetd \
    greetd-regreet \
    hyprlock \
    wlogout \
    xdg-desktop-portal-gnome \
    xwayland-satellite \
    xorg-server \
    xorg-xinit \
    frameworkintegration \
    layer-shell-qt \
    libportal-gtk4 \
    xdg-user-dirs \
    shikane