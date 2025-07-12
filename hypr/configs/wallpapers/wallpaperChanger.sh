#!/usr/bin/env bash
set -euo pipefail

WALLDIR="${1:-$HOME/.config/hypr/configs/wallpapers}"
INTERVAL="${2:-300}"

if [[ ! -d "$WALLDIR" ]]; then
  echo "Diretório inválido: $WALLDIR"
  exit 1
fi

change_wall() {
  local -n images=$1
  local num_disp num_imgs
  num_imgs=${#images[@]}
  mapfile -t outputs < <(swww query | cut -d: -f1)

  num_disp=${#outputs[@]}
  (( num_disp == 0 )) && return

  mapfile -t idxs < <(shuf -i 0-$((num_imgs-1)) -n "$num_disp")

  for i in "${!outputs[@]}"; do
    swww img \
      --resize fit \
      --outputs "${outputs[i]}" \
      --transition-type grow \
      --transition-duration 1.5 \
      "${images[idxs[i]]}"
  done
}

mapfile -t IMAGES < <(find "$WALLDIR" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.png' \) )

(( ${#IMAGES[@]} == 0 )) && { echo "Nenhuma imagem em $WALLDIR"; exit 1; }

trap 'change_wall IMAGES' USR1

change_wall IMAGES


while sleep "$INTERVAL"; do
  change_wall IMAGES
done
