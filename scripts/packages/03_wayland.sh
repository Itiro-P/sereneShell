#!/usr/bin/env bash
set -euo pipefail

echo "Instalando compositores e dependências."

yay -S --needed --noconfirm \
    niri labwc labwc-theme-adwaita kanshi mako rofi \
    grim slurp wl-mirror wlogout swayosd \
    xdg-desktop-portal-gnome \
    xdg-desktop-portal-gtk \
    xdg-desktop-portal-wlr \
    xwayland-satellite xfce-polkit
