#!/bin/bash

# Generated menu images URL mapping
declare -A urls=(
  ["haemul-jjim"]="idWQAnm5"
  ["agu-jjim"]="n9frZxEl"
  ["dak-hanmari"]="QUmK94AZ"
  ["galbi-jjim"]="AJrUbt5Q"
  ["kalguksu"]="sHHNYLLN"
  ["haemul-kalguksu"]="rHHvhd6o"
  ["janchi-guksu"]="y9dv8tFa"
  ["manduguk"]="aAfq3bMn"
  ["naengmyeon"]="SZvZunau"
  ["bibim-naengmyeon"]="oZpQRgUc"
  ["mulhoe"]="isqULWZx"
  ["milmyeon"]="v4prbgX6"
  ["samgyeopsal"]="6A7hXJcS"
  ["galbi-gui"]="VYIdnzdH"
  ["bulgogi"]="9cOcUBej"
  ["bossam"]="7Fm7LXuT"
  ["jeyuk-bokkeum"]="vBX5aUBC"
  ["ojingeo-bokkeum"]="9flC7KV5"
  ["nakji-bokkeum"]="Ku92TLX3"
  ["dakgalbi"]="6eqwP7S6"
  ["galchijorim"]="KBL2A9zK"
  ["jangeo-gui"]="iVeCAha9"
  ["daegu-tang"]="gsOM7iOZ"
  ["mulmegi-tang"]="3RiudgMg"
  ["bibimbap"]="d2jd5Dz6"
)

echo "Downloading ${#urls[@]} menu images..."
count=0

for menu in "${!urls[@]}"; do
  ((count++))
  echo "[$count/${#urls[@]}] Downloading $menu..."
  curl -sL "https://www.genspark.ai/api/files/s/${urls[$menu]}" -o "public/menus/$menu.jpg"
done

echo ""
echo "✅ Download complete!"
echo "Total images downloaded: ${#urls[@]}"
ls -lh public/menus/*.jpg | wc -l
