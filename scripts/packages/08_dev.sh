#!/usr/bin/env bash
set -euo pipefail

echo "Instalando programas de desenvolvimento."

yay -S --needed --noconfirm \
    git \
    gittyup \
    #gradle \
    jdk21-openjdk \
    junit \
    dart-sass \
    python-beautifulsoup4 \
    python-click \
    python-pandas \
    python-pip \
    docker \
    docker-compose \
    docker-buildx \
    yarn
