#!/usr/bin/env bash
set -euo pipefail

echo "Instalando ferramentas de produtividade."

yay -S --needed --noconfirm \
    libreoffice-fresh libreoffice-codehighlighter2 \
    mendeley-reference-manager \
    appimagelauncher pear-desktop
