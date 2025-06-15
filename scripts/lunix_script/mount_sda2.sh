#!/bin/bash

# اسم القسم (مثلاً sda4)
PARTITION="/dev/sda4"

# اسم المستخدم (استبدله لو مختلف)
USERNAME=$(whoami)
MOUNT_POINT="/media/$USERNAME/sda4"

# الحصول على UUID
UUID=$(blkid -s UUID -o value "$PARTITION")

# التأكد من أن UUID تم الحصول عليه
if [ -z "$UUID" ]; then
  echo "❌ لم يتم العثور على UUID للقسم $PARTITION"
  exit 1
fi

# إنشاء مجلد التركيب
sudo mkdir -p "$MOUNT_POINT"

# إضافة السطر إلى fstab (إذا لم يكن مضافًا مسبقًا)
FSTAB_LINE="UUID=$UUID $MOUNT_POINT ntfs defaults,uid=1000,gid=1000,dmask=027,fmask=137 0 0"
if ! grep -qs "$UUID" /etc/fstab; then
  echo "$FSTAB_LINE" | sudo tee -a /etc/fstab
  echo "✅ تمت إضافة السطر إلى /etc/fstab"
else
  echo "ℹ️ السطر موجود مسبقًا في /etc/fstab"
fi

# تركيب القسم مباشرة
sudo mount "$MOUNT_POINT" && echo "✅ تم تركيب القسم بنجاح في $MOUNT_POINT"

