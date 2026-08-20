#!/usr/bin/env bash
set -euo pipefail
echo "Instalando pacotes da sessão Wayland e Inputs."
yay -S --needed --noconfirm \
    niri \
    niri-focused-booster \
    sddm \
    xdg-desktop-portal-gnome \
    xwayland-satellite \
    xorg-xwayland \
    xorg-server \
    xorg-xinit \
    xf86-input-evdev \
    weston \
    archlinux-xdg-menu \
    gnome-keyring \
    networkmanager \
    wpa_supplicant \
    bluez \
    bluez-utils \
    overskride \
    sof-firmware \
    shikane \
    fcitx5 \
    fcitx5-configtool \
    fcitx5-gtk \
    fcitx5-material-color \
    fcitx5-qt