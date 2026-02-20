#!/bin/bash

declare -A urls=(
  ["kongnamul-gukbap"]="WBS0ZgEJ"
  ["gul-gukbap"]="w8M9beFf"
  ["chueotang"]="KZho3eyi"
  ["yukgaejang"]="0bXQO74i"
  ["jjimdak"]="ngsROjGI"
)

for menu in "${!urls[@]}"; do
  echo "Downloading $menu..."
  curl -sL "https://www.genspark.ai/api/files/s/${urls[$menu]}" -o "public/menus/$menu.jpg"
done

echo "Download complete!"
ls -lh public/menus/*.jpg | wc -l
