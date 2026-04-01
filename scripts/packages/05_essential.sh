#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes essenciais."

yay -S --needed --noconfirm \
    thunar \
    thunar-vcs-plugin \
    thunar-volman \
    ristretto \
    gnome-disk-utility \
    seahorse \
    kitty \
    vencord \
    firefox \
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
