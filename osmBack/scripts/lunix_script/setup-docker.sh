#!/bin/bash

# سكريبت لإعداد صلاحيات وتشغيل Docker على Ubuntu

echo "🔄 تحديث النظام..."
sudo apt update -y

echo "🐳 التأكد من تثبيت Docker..."
if ! command -v docker &> /dev/null
then
    echo "🚀 تثبيت Docker..."
    sudo apt install -y docker.io docker-compose
else
    echo "✔️ Docker موجود بالفعل."
fi

echo "🔧 إضافة المستخدم الحالي لمجموعة docker..."
sudo usermod -aG docker $USER

echo "▶️ تشغيل Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

echo "Sucssec creat"
echo "📌 ملاحظة: لازم تعمل تسجيل خروج/Login أو تكتب: newgrp docker"
echo "بعدها جرب: docker ps"

# creat file exe
# nano setup-docker.sh
chmod +x setup-docker.sh
