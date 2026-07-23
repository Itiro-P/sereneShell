#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes de temas e fontes."

yay -S --needed --noconfirm \
    pkgconf \
    automake \
    bibata-cursor-theme-bin \
    nwg-look \
    awww \
    matugen-bin \
    materia-kde \
    adw-gtk-theme \
    qt6ct-kde \
    kvantum \
    kvantum-qt5 \
    adwsteamgtk \
    kvantum-theme-materia \
    tela-circle-icon-theme-standard \
    noto-fonts-cjk \
    noto-fonts-emoji \
    noto-fonts-extra \
    otf-monaspace \
    ttf-fira-code \
    ttf-dejavu \
    ttf-liberation \
    ttf-mononoki-nerd \
    ttf-nerd-fonts-symbols \
    ttf-nerd-fonts-symbols-common \
    ttf-roboto \
    starship \
    fcitx5 \
    fcitx5-configtool \
    fcitx5-gtk \
    fcitx5-material-color \
    fcitx5-qt \
    sddm
