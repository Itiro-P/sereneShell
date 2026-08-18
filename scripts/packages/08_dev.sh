#!/usr/bin/env bash
set -euo pipefail

echo "Instalando programas e bibliotecas de desenvolvimento."

yay -S --needed --noconfirm \
    pkgconf \
    automake \
    neovim \
    visual-studio-code-bin \
    man-pages \
    git \
    gitte \
    jq \
    gradle \
    jdk-openjdk \
    jdk11-openjdk \
    jdk17-openjdk \
    jdk8-openjdk \
    archlinux-java-run \
    junit \
    maven \
    dart-sass \
    python-pandas \
    python-pip \
    python-pipx \
    python-automat \
    python-github3py \
    docker \
    docker-compose \
    docker-buildx \
    fuse-overlayfs \
    yarn \
    npm \
    go \
    clang \
    cmake \
    glib2-devel \
    llvm \
    lm-studio-bin