#!/usr/bin/env bash
# Telecharge un pack de polices 2026 (OFL/libre) depuis le CDN Fontsource,
# self-heberge les .woff2 et genere fonts.css (@font-face variables).
set -euo pipefail
cd "$(dirname "$0")"
CDN="https://cdn.jsdelivr.net/fontsource/fonts"

# format: cssName|url_path|remote_file|local_file|weightRange|kind
FONTS=(
  "Inter|inter:vf@latest|latin-wght-normal.woff2|inter.woff2|100 900|var"
  "Space Grotesk|space-grotesk:vf@latest|latin-wght-normal.woff2|space-grotesk.woff2|300 700|var"
  "Bricolage Grotesque|bricolage-grotesque:vf@latest|latin-wght-normal.woff2|bricolage.woff2|200 800|var"
  "Archivo|archivo:vf@latest|latin-wght-normal.woff2|archivo.woff2|100 900|var"
  "Syne|syne:vf@latest|latin-wght-normal.woff2|syne.woff2|400 800|var"
  "Unbounded|unbounded:vf@latest|latin-wght-normal.woff2|unbounded.woff2|200 900|var"
  "Big Shoulders Display|big-shoulders-display:vf@latest|latin-wght-normal.woff2|big-shoulders.woff2|100 900|var"
  "Fraunces|fraunces:vf@latest|latin-wght-normal.woff2|fraunces.woff2|100 900|var"
  "Instrument Serif|instrument-serif@latest|latin-400-normal.woff2|instrument-serif.woff2|400|static"
  "Anton|anton@latest|latin-400-normal.woff2|anton.woff2|400|static"
  "DM Serif Display|dm-serif-display@latest|latin-400-normal.woff2|dm-serif-display.woff2|400|static"
)

echo "/* Polices self-hebergees — genere par download-fonts.sh. Ne pas editer a la main. */" > fonts.css
ok=0; fail=0
for row in "${FONTS[@]}"; do
  IFS='|' read -r name urlpath remote local weight kind <<< "$row"
  url="$CDN/$urlpath/$remote"
  if curl -sfL --max-time 40 -o "$local" "$url"; then
    size=$(stat -f%z "$local" 2>/dev/null || echo 0)
    if [ "$size" -lt 5000 ]; then echo "  ⚠ $name trop petit ($size o) — ignore"; rm -f "$local"; fail=$((fail+1)); continue; fi
    printf '  ✓ %-22s %6s Ko\n' "$name" "$((size/1024))"
    {
      echo "@font-face{"
      echo "  font-family:\"$name\";"
      echo "  src:url(\"./$local\") format(\"woff2\");"
      echo "  font-weight:$weight;"
      echo "  font-style:normal;"
      echo "  font-display:swap;"
      echo "}"
    } >> fonts.css
    ok=$((ok+1))
  else
    echo "  ✗ echec: $name ($url)"; fail=$((fail+1))
  fi
done
echo "----"
echo "Polices OK: $ok — echecs: $fail"
echo "CSS: $(pwd)/fonts.css"
