ICONS=(circle-check circle-x mic zap split sparkles settings)
mkdir -p icons
for n in "${ICONS[@]}"; do
  curl -sSL "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${n}.svg" | \
    sed -e 's/currentColor/#fff/' -e 's/0 0 24 24/-6 -6 36 36/' > "icons/${n}.svg"
  rsvg-convert -w 96 -h 96 -b none "icons/${n}.svg" -o "icons/${n}.png"
  rm "icons/${n}.svg"
done