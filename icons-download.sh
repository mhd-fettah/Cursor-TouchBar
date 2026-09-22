#!/usr/bin/env bash
set -euo pipefail

# Keep this list in sync with ICONS in catalog.js.
ICONS=(
  panel-left panel-bottom panel-right message-square-plus message-circle
  list-checks bot folder layers zap circle-check circle-x split mic sparkles
  terminal git-branch search plus play file save undo-2 eye pin list pencil
  bug wrench message-square code chevron-left chevron-right settings
)
mkdir -p icons
for n in "${ICONS[@]}"; do
  curl -sSL "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${n}.svg" | \
    sed -e 's/currentColor/#fff/' -e 's/0 0 24 24/-6 -6 36 36/' > "icons/${n}.svg"
  rsvg-convert -w 96 -h 96 -b none "icons/${n}.svg" -o "icons/${n}.png"
  rm "icons/${n}.svg"
done
