#!/usr/bin/env bash
set -euo pipefail

echo "Instalando pacotes do Desktop."

yay -S --needed --noconfirm \
  network-manager-applet seahorse gnome-disk-utility \
  thunar ristretto nwg-look \
  pavucontrol qalculate-gtk \
  obsidian vesktop zen-browser-bin
