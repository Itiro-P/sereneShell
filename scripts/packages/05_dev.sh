#!/usr/bin/env bash
set -euo pipefail

echo "Instalando ferramentas de desenvolvimento."

yay -S --needed --noconfirm \
  jdk21-openjdk gradle junit \
  python python-pip python-click python-pandas python-beautifulsoup4 \
  docker docker-compose docker-buildx yarn \
  dart-sass downgrade
