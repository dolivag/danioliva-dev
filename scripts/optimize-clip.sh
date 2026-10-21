#!/usr/bin/env bash
# Prepara un vídeo corto en bucle para una tarjeta o la página de un proyecto: sin audio, en MP4 (H.264) y WebM (VP9),
# con un póster JPG. Salida: public/projects/<proyecto>/<nombre>.mp4, .webm y .jpg (la ruta sin extensión es `clip` en
# `src/data/site.ts`).
#
#   scripts/optimize-clip.sh hogarnizer clip grabacion.mov            # 960 px de ancho
#   scripts/optimize-clip.sh hogarnizer clip grabacion.mov 390        # un móvil en vertical: 390 px
#   scripts/optimize-clip.sh hogarnizer clip grabacion.mov 960 2.5 8  # desde el segundo 2,5, 8 s de duración
#
# Necesita ffmpeg. Conviene que dure de 5 a 10 s y pese menos de unos 400 KB.
set -euo pipefail
[ $# -ge 3 ] || { sed -n '2,10p' "$0"; exit 1; }
project=$1; name=$2; input=$3; width=${4:-960}; start=${5:-0}; length=${6:-}
out="$(cd "$(dirname "$0")/.." && pwd)/public/projects/$project"
mkdir -p "$out"
trim=(-ss "$start"); [ -n "$length" ] && trim+=(-t "$length")
filter="fps=25,scale=${width}:-2:flags=lanczos"
ffmpeg -v error -y "${trim[@]}" -i "$input" -an -vf "$filter" -c:v libx264 -preset slow -crf 29 -pix_fmt yuv420p -movflags +faststart "$out/$name.mp4"
ffmpeg -v error -y -i "$out/$name.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 37 -row-mt 1 "$out/$name.webm"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/$name.mp4")
ffmpeg -v error -y -ss "$(awk -v d="$dur" 'BEGIN{printf "%.2f", d*0.4}')" -i "$out/$name.mp4" -frames:v 1 -q:v 4 "$out/$name.jpg"
ls -la "$out/$name".{mp4,webm,jpg}
