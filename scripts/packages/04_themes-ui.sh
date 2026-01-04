#!/usr/bin/env bash
set -euo pipefail

echo "Instalando temas e seus utilitários."

yay -S --needed --noconfirm \
  adw-gtk-theme bibata-cursor-theme papirus-icon-theme \
  kvantum kvantum-theme-libadwaita-git \
  qt6ct qt6-wayland qt6-5compat \
  qt6-base qt6-declarative qt6-svg qt6-shadertools \
  qt6-translations qt6-virtualkeyboard
