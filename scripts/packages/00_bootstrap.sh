#!/usr/bin/env bash
set -euo pipefail

echo "Instalando yay."

if ! command -v yay &>/dev/null; then
    echo "yay não encontrado. Instanlando-o..."
    sudo pacman -S --needed --noconfirm base-devel git
    git clone https://aur.archlinux.org/yay.git /tmp/yay
    cd /tmp/yay
    makepkg -si --noconfirm

else
    echo "yay já instalado."

fi

echo "Saindo..."