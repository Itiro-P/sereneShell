#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes de temas e fontes."

yay -S --needed --noconfirm \
    adw-gtk-theme \
    bibata-cursor-theme \
    kvantum \
    kvantum-theme-libadwaita-git \
    labwc-theme-adwaita \
    nwg-look \
    papirus-icon-theme \
    qt6ct \
    sddm-astronaut-theme \
    awww \
    matugen-bin \
    noto-fonts \
    noto-fonts-cjk \
    noto-fonts-emoji \
    ttf-fira-code \
    ttf-dejavu \
    ttf-liberation \
    ttf-roboto \
    ttf-nerd-fonts-symbols \
    ttf-nerd-fonts-symbols-common \
    ttf-roboto \
    starship \
    qt6-5compat \
    qt6-base \
    qt6-declarative \
    qt6-multimedia \
    qt6-multimedia-ffmpeg \
    qt6-shadertools \
    qt6-svg \
    qt6-translations \
    qt6-virtualkeyboard \
    qt6-wayland
