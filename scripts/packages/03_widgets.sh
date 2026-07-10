#!/usr/bin/env bash
set -euo pipefail

echo "Instalando widgets e utilitários."

yay -S --needed --noconfirm \
    libastal-meta \
    libastal-niri-git \
    grim \
    slurp \
    wl-mirror \
    wev
