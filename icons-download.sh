#!/usr/bin/env bash
set -euo pipefail

# Renders every icon in src/catalog/icons.js to a white-on-transparent PNG.
# The catalog is the single source of the list, so the PNG folder, package.json,
# and the picker in the configuration panel cannot drift apart.
#
#   ./icons-download.sh
#
# Needs rsvg-convert (brew install librsvg) or falls back to macOS sips.

cd "$(dirname "$0")"

SIZE=96
RAW=https://raw.githubusercontent.com/lucide-icons/lucide/main/icons

if command -v rsvg-convert >/dev/null 2>&1; then
	render() { rsvg-convert -w "$SIZE" -h "$SIZE" -b none "$1" -o "$2"; }
elif command -v sips >/dev/null 2>&1; then
	render() { sips -s format png --resampleHeightWidth "$SIZE" "$SIZE" "$1" --out "$2" >/dev/null; }
else
	echo "Need rsvg-convert (brew install librsvg) or macOS sips." >&2
	exit 1
fi

icons=$(node -e 'console.log(require("./src/catalog/icons.js").ICON_IDS.join("\n"))')
total=$(echo "$icons" | wc -l | tr -d ' ')
mkdir -p icons
index=0

while IFS= read -r name; do
	index=$((index + 1))
	printf '\r[%3d/%3d] %-28s' "$index" "$total" "$name"

	# Recolor the stroke to white and pad the 24x24 viewBox so the glyph does
	# not touch the edges of the button.
	curl -sSfL "$RAW/${name}.svg" |
		sed -e 's/currentColor/#fff/' -e 's/0 0 24 24/-6 -6 36 36/' > "icons/${name}.svg"
	render "icons/${name}.svg" "icons/${name}.png"
	rm "icons/${name}.svg"
done <<< "$icons"

printf '\rRendered %d icons.%-28s\n' "$total" ''

# Drop PNGs for icons that have left the catalog.
for file in icons/*.png; do
	name=$(basename "$file" .png)
	if ! echo "$icons" | grep -qx "$name"; then
		echo "Removing stale icon: $name"
		rm "$file"
	fi
done
