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
sudo systemctl enable sddm
sudo systemctl enable swayosd-libinput-backend
sudo systemctl enable greetd

echo "Configurando Stasis e Docker"
sudo usermod -aG input,video,docker $USER

echo "Configurando o Warp"
warp-cli registration new
warp-cli trusted ethernet enable

echo "Configurando tema Colloid"
mkdir -p ~/.config/gtk-4.0/
ln -sf /usr/share/themes/adw-gtk3-dark/gtk-4.0/{assets,gtk.css,gtk-dark.css} ~/.config/gtk-4.0/

echo "Configurando temas e fontes GTK."
gsettings set org.gnome.desktop.interface gtk-theme 'adw-gtk3-dark'
gsettings set org.gnome.desktop.interface icon-theme 'Tela circle dark'
gsettings set org.gnome.desktop.interface cursor-theme 'Bibata-Modern-Classic'
gsettings set org.gnome.desktop.interface font-name 'Monospace Regular 10'
gsettings set org.gnome.desktop.interface monospace-font-name 'FiraCode Nerd Font 10'
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'

echo "Copiando configurações."
cp "$BASE_DIR/../src/dot_bashrc" ~/.bashrc
cp -r "$BASE_DIR/../src/etc" /etc
cp -r "$BASE_DIR/../src/dot_config/." ~/.config/

echo "Removendo cache do Yay"
yay -Scc --noconfirm

echo "Removendo dependências não usadas"
yay -Ycc --noconfirm

echo "Instalação finalizada. Reinicie o sistema."
