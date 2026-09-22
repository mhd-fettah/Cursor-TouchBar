#!/usr/bin/env bash
set -euo pipefail

# Keep this list in sync with ICONS in catalog.js.
ICONS=(
  panel-left panel-bottom panel-right message-square-plus message-circle
  list-checks bot folder layers zap circle-check circle-x split mic sparkles
  terminal git-branch search plus play file save undo-2 eye pin list pencil
  bug wrench message-square code chevron-left chevron-right settings
  home copy refresh-cw link bookmark layout-grid keyboard trash-2
  download upload filter moon sun
  redo-2 clipboard-copy scissors git-commit-vertical git-merge git-pull-request
  rocket flask-conical package database cloud server bell clock
  file-code file-plus folder-open send share-2 external-link palette
  circle-alert lightbulb book-open archive mail messages-square replace diff
  panel-top layout-dashboard app-window monitor pause square brackets
  square-code lock star heart user plug cpu hard-drive wifi volume-2
  log-out circle-question-mark target workflow blocks puzzle rotate-ccw repeat
  inbox file-text contrast grip-vertical
)
mkdir -p icons
for n in "${ICONS[@]}"; do
  curl -sSL "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${n}.svg" | \
    sed -e 's/currentColor/#fff/' -e 's/0 0 24 24/-6 -6 36 36/' > "icons/${n}.svg"
  rsvg-convert -w 96 -h 96 -b none "icons/${n}.svg" -o "icons/${n}.png"
  rm "icons/${n}.svg"
done
