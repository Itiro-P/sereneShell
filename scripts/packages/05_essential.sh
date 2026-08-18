#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes essenciais de sistema."

yay -S --needed --noconfirm \
    seahorse \
    kitty \
    vesktop \
    firefox \
    transmission-gtk \
    qalculate-gtk \
    btop \
    fastfetch \
    nvtop \
    downgrade \
    xdg-utils \
    cloudflare-warp-bin \
    openvpn \
    zerotier-one \
    appimagelauncher \
    7zip \
    unrar \
    unzip \
    zip \
    pacman-contrib \
    vulkan-tools \
    smartmontools \
    power-profiles-daemon