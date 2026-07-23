#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes essenciais."

yay -S --needed --noconfirm \
    seahorse \
    kitty \
    vesktop \
    firefox \
    transmission-gtk \
    qalculate-gtk \
    network-manager-applet \
    btop \
    fastfetch \
    downgrade \
    xdg-utils \
    cloudflare-warp-bin \
    appimagelauncher \
    7zip \
    pacman-contrib \
    vulkan-tools \
    nvtop \
    smartmontools \
    upower \
    power-profiles-daemon \
    xfce-polkit
