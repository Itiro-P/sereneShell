#!/usr/bin/env bash
set -euo pipefail

echo "Instalando ferramentas de produtividade."

yay -S --needed --noconfirm \
    neovim \
    nano \
    obsidian \
    visual-studio-code-bin \
    libreoffice-fresh \
    libreoffice-codehighlighter2 \
    mendeley-reference-manager \
    man-pages \
    unrar \
    unzip \
    zip
