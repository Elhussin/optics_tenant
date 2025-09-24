#!/bin/bash

while IFS= read -r line; do
  # إزالة المسافات الزائدة
  dir=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  # تجاهل الأسطر الفارغة
  if [ -n "$dir" ]; then
    mkdir -p "$dir"
  fi
done < tree.txt



# احفظه كـ create_dirs.sh

# ثم شغله: bash create_dirs.sh

# هيعمل كل المجلدات طبقًا لـ tree.txt