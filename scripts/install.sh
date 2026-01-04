#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" -eq 0 ]]; then
  echo "Não execute este script como root."
  echo "Execute como usuário normal."
  exit 1
fi

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

PACKAGE_SCRIPTS=(
  00_bootstrap.sh
  01_base.sh
  02_desktop.sh
  03_wayland.sh
  04_themes-ui.sh
  05_dev.sh
  06_media-gaming.sh
  07_productivity.sh
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
sudo systemctl enable sddm
systemctl enable --user stasis

echo "Configurando Stasis"
sudo usermod -aG input,video $USER

echo "Configurando o Warp"
warp-cli registration new
warp-cli trusted ethernet enable

echo "Configurando SDDM."

echo "[Theme]
Current=sddm-astronaut-theme" | sudo tee /etc/sddm.conf

echo "[General]
InputMethod=qtvirtualkeyboard" | sudo tee /etc/sddm.conf.d/virtualkbd.conf || true

sudo sed -i 's|^ConfigFile=.*|ConfigFile=Themes/pixel_sakura.conf|' \
  /usr/share/sddm/themes/sddm-astronaut-theme/metadata.desktop


echo "Configurando temas e fontes GTK."
gsettings set org.gnome.desktop.interface gtk-theme 'adw-gtk3-dark'
gsettings set org.gnome.desktop.interface icon-theme 'Papirus-Dark'
gsettings set org.gnome.desktop.interface cursor-theme 'Bibata-Modern-Classic'
gsettings set org.gnome.desktop.interface font-name 'Monospace Regular 10'
gsettings set org.gnome.desktop.interface monospace-font-name 'FiraCode Nerd Font 10'
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'

echo "Copiando configurações."
cp "$BASE_DIR/../src/.bashrc" ~/.bashrc

cp -r "$BASE_DIR/../src/.config" ~/.config

echo "Instalação finalizada. Reinicie o sistema."
