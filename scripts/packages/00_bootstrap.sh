#!/usr/bin/env bash
set -euo pipefail
echo "Instalando dependências base"
sudo pacman -S --needed --noconfirm automake autoconf debugedit fakeroot
echo "Instalando yay."
if ! command -v yay &>/dev/null; then
    echo "yay não encontrado. Instalando-o..."
    sudo pacman -S --needed --noconfirm base-devel git
    git clone https://aur.archlinux.org/yay.git /tmp/yay
    cd /tmp/yay
    makepkg -si --noconfirm
else
    echo "yay já instalado."
fi
echo "Saindo..."