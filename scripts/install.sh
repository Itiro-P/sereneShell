#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" -eq 0 ]]; then
  echo "Não execute este script como root."
  echo "Execute como usuário normal.\n"
  exit 1
fi

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

PACKAGE_SCRIPTS=(
  00_bootstrap.sh
  01_themes-ui.sh
  02_wayland-session.sh
  03_widgets.sh
  04_multimedia.sh
  05_essential.sh
  06_productivity.sh
  07_gaming.sh
  08_dev.sh
)

echo

for script in "${PACKAGE_SCRIPTS[@]}"; do
  SCRIPT="$BASE_DIR/packages/$script"

  echo "Executando $script"
  chmod +x "$SCRIPT"
  "$SCRIPT"
  echo "$script concluído"
  echo
done

echo "Pacotes instalados."

echo "Configurando serviços no Systemd."
sudo systemctl enable --now warp-svc

echo "Configurando Stasis e Docker"
sudo usermod -aG input,video,docker,gamemode $USER

sudo systemctl enable sddm

echo "Configurando o Warp"
warp-cli registration new
warp-cli trusted ethernet enable

echo "Configurando temas e fontes GTK."
gsettings set org.gnome.desktop.interface gtk-theme 'adw-gtk3-dark'
gsettings set org.gnome.desktop.interface icon-theme 'Tela-circle-dark'
gsettings set org.gnome.desktop.interface cursor-theme 'Bibata-Modern-Classic'
gsettings set org.gnome.desktop.interface font-name 'Noto Sans Regular 10'
gsettings set org.gnome.desktop.interface monospace-font-name 'FiraCode Nerd Font 10'
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'

echo "Copiando configurações."
cp "$BASE_DIR/../src/dot_bashrc" ~/.bashrc
cp -r "$BASE_DIR/../src/dot_config/." ~/.config/

echo "Removendo cache do Yay"
yay -Scc --noconfirm

echo "Removendo dependências não usadas"
yay -Ycc --noconfirm

echo "Aplicando Matugen"
matugen image --source-color-index 0 ~/.config/serene-shell/wallpapers/lyw2zl_1920x1080.png
awww img ~/.config/serene-shell/wallpapers/lyw2zl_1920x1080.png

echo "Instalação finalizada. Reinicie o sistema."
