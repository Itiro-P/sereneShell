#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes essenciais."

yay -S --needed --noconfirm \
    nautilus \
    ristretto \
    gnome-disk-utility \
    seahorse \
    kitty \
    vesktop \
    zen-browser-bin \
    transmission-gtk \
    qalculate-gtk \
    network-manager-applet \
    btop \
    fastfetch \
    downgrade \
    power-profiles-daemon \
    xdg-utils \
    xfce-polkit \
    stasis \
    cloudflare-warp-bin \
    appimagelauncher
