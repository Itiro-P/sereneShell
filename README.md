# Sobre

Aqui eu guardo minhas configurações pessoais para configuração rápida de um sistema Archlinux + Hyprland.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1eba113f-37ed-4c71-a401-90c33e70b968" />

Essas configurações são totalmente _pessoais_. Não espere que funcione em qualquer sistema.
A distro que eu mais uso é o Archlinux, mas não uso nada que dependa diretamente dele (além dos PKGSBUILDs). Apenas uso a instalação básica do Hyprland.

## Instalação

Clone e acesse este repositório:

- `git clone https://github.com/Itiro-P/sereneShell.git`;
- `cd sereneShell`.

Instale as dependências:

- Todas as dependências estão listadas em `packages.txt`.
- Para distros baseadas em Archlinux com acesso ao AUR. Apenas use:
    - `yay -Syu $(cat packages.txt)`;

Mova os conteúdos da pasta .config para sua `$HOME/.config`. Que normalmente leva até `/home/seuUsuario/.config`;

- `cp -r .config/* ~/.config`

Reinice o sitema. As configurações já devem ser aplicadas.

## Troubleshooting

Caso ocorra problemas, não hesite em abrir uma 'issue' ou me contatar.
