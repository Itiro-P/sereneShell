#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes da sessão Wayland."

yay -S --needed --noconfirm \
    niri \
    gamescope \
    gtklock \
    gtklock-dpms-module \
    gtklock-playerctl-module \
    gtklock-powerbar-module \
    gtklock-userinfo-module \
    sddm \
    wlogout \
    xdg-desktop-portal-gnome \
    xdg-desktop-portal-gtk \
    xwayland-satellite \
