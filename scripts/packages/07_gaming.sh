#!/usr/bin/env bash
set -euo pipefail

echo "Instalando programas para jogos."

yay -S --needed --noconfirm \
    heroic-games-launcher-bin \
    lib32-mangohud \
    mangohud \
    mangojuice \
    steam \
    hydra-launcher-bin \
    proton-ge-custom-bin \
    protonup-qt \
    wine \
    gamemode \
    pdx-unlimiter