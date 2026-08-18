#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes da sessão Wayland e Inputs."

yay -S --needed --noconfirm \
    niri \
    niri-focused-booster \
    sddm \
    xdg-desktop-portal-gnome \
    xwayland-satellite \
    archlinux-xdg-menu \
    gnome-keyring \
    shikane \
    fcitx5 \
    fcitx5-configtool \
    fcitx5-gtk \
    fcitx5-material-color \
    fcitx5-qt