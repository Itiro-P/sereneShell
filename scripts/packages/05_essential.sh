#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes essenciais."

yay -S --needed --noconfirm \
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
    stasis \
    cloudflare-warp-bin \
    appimagelauncher \
    7zip \
    pacman-contrib \
    gnome-keyring \
    gnome-online-accounts-gtk \
    gvfs \
    libgnome-keyring \
    polkit-qt6 \
    vulkan-tools \
    sudo \
    nvtop \
    smartmontools \
    upower \
    zram-generator \
    bluez \
    bluez-utils