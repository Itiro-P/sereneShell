#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes essenciais."

yay -S --needed --noconfirm \
    git nano neovim man-pages fastfetch btop \
    rust \
    unzip zip unrar starship \
    noto-fonts-cjk noto-fonts-emoji \
    ttf-fira-code ttf-liberation ttf-roboto \
    ttf-nerd-fonts-symbols ttf-nerd-fonts-symbols-common \
    xdg-utils power-profiles-daemon