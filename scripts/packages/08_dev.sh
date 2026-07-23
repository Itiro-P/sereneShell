#!/usr/bin/env bash
set -euo pipefail

echo "Instalando programas de desenvolvimento."

yay -S --needed --noconfirm \
    git \
    gradle \
    jdk-openjdk \
    jdk11-openjdk \
    jdk17-openjdk \
    jdk8-openjdk \
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
    rust \
    clang \
    cmake \
    glib2-devel \
    llvm \
    meson \
    ninja \
    gitte \
    jq \
    openvpn \
    zerotier-one \
    lm-studio-bin \
    archlinux-java-run
