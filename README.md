# Sobre

Aqui eu guardo minhas configurações pessoais para configuração rápida de um sistema Archlinux + Hyprland.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1eba113f-37ed-4c71-a401-90c33e70b968" />

Essas configurações são totalmente *pessoais*. Não espere que funcione em qualquer sistema.
A distro que eu mais uso é o Archlinux, mas não uso nada que dependa diretamente dele. Apenas uso a instalação básica do Hyprland.

## Dependências

- Hyprland: O compositor wayland e seus plugins principais;
  - `hypr-zoom`;
  - `hyprcap`;
  - `hyprshot`;
  - `hypridle`;
  - `hyprlight`;
  - `hyprlock`;
  - `hyprpop`;
  - `hyprsunset`;
  - `hyprwindow`;
  - `hyprpolkitagent`.
- AGS V3 com todas as bibliotecas do Astal:
  - `aylurs-gtk-shell-git`.
- Cpupower: Para gerenciamento da bateria;
  - `cpupower`.
  - `upower`.
- Cava: Para visualização de áudio;
  - `cava`.
- Mako: Sistema de notificações;
  - `mako`.
- Navegador: Zen;
  - `zen-browser-bin`.
- NetworkManager-applet: Para configuração de redes;
  - `network-manager-applet`.
- Pipeware e Pavucontrol: Para controle de áudio;
  - `pavucontrol`;
  - `pipewire`;
    - `pipewire-alsa`;
    - `pipewire-audio`;
    - `pipewire-jack`;
    - `pipewire-pulse`.
- Starship: Para customização do Bash;
  - `starship`.
- Foot: Terminal;
  - `foot`.
- Tema e itens Colloid (Gtk) e Darkly (Qt) com as cores Catppuccin Mocha;
  - `darkly-bin`;
  - (Colloid)[https://github.com/vinceliuice/Colloid-gtk-theme].
- Wlogout: Manejo de término de sessão;
  - `wlogout`;
- Gerenciador de arquivos: Dolphin;
  - `dolphin`.
- Swww: Papéis de parede;
  - `swww`.
- Fontes:
  - `ttf-dejavu`;
  - `ttf-fira-code`;
  - `ttf-hack`;
  - `ttf-jetbrains-mono`;
  - `ttf-liberation`;
  - `ttf-nerd-fonts-symbols`;
  - `ttf-nerd-fonts-symbols-common`;
  - `ttf-roboto`;
  - `noto-fonts`;
  - `noto-fonts-cjk`:
  - `noto-fonts-emoji`;
  - `noto-fonts-extra`;
  - `adobe-source-code-pro-fonts`;
  - `adwaita-fonts`.
- Nwg Look: Organização de temas Gtk;
  - `nwg-look`.
- Nwg Displays: Configuração de monitores;
  - `nwg-displays`.
- Qt5ct e qt6ct: Gerenciador de temas Qt5 e Qt6;
  - `qt5ct`;
  - `qt6ct`.
- Fuzzel: Launcher de aplicativos;
  - `fuzzel`. 

## Instalação

Faça uma instalação limpa do arch + hyprland e baixe todas as dependências. Em distros baseadas em Arch com acesso ao AUR o seguinte comando pode ser usado com `yay`:
- `yay -Syu hypr-zoom hyprcap hyprshot hypridle hyprlight hyprlock hyprpop hyprsunset hyprwindow hyprpolkitagent aylurs-gtk-shell-git cpupower upower cava mako networkmanager-applet pavucontrol pipewire starship foot darkly-bin wlogout dolphin swww ttf-dejavu ttf-hack ttf-jetbrains-mono ttf-liberation ttf-nerd-fonts-symbols ttf-nerd-fonts-symbols-common ttf-roboto noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra adobe-source-code-pro-fonts adwaita-fonts zen-browser-bin nwg-look nwg-displays qt5ct qt6ct fuzzel`.

Clone este repositório em sua $HOMR/.config. Isso normalmente é `/home/.config/`:
 - `git clone https://github.com/Itiro-P/itiroDots.git`;
