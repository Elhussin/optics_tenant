#!/bin/bash

# قائمة الخدمات الاختيارية
SERVICES=(
    apache2
    nginx
    bluetooth
    avahi-daemon
    cups-browsed
    cups
    ModemManager
    openvpn
)

if [ "$1" == "stop" ]; then
    echo "🔴 إيقاف جميع الخدمات الاختيارية..."
    for service in "${SERVICES[@]}"; do
        sudo systemctl stop "$service" 2>/dev/null
        sudo systemctl disable "$service" 2>/dev/null
        echo "❌ تم إيقاف وتعطيل $service"
    done
elif [ "$1" == "start" ]; then
    echo "🟢 تشغيل جميع الخدمات الاختيارية..."
    for service in "${SERVICES[@]}"; do
        sudo systemctl enable "$service" 2>/dev/null
        sudo systemctl start "$service" 2>/dev/null
        echo "✅ تم تشغيل وتفعيل $service"
    done
else
    echo "الاستخدام: $0 start | stop"
    exit 1
fi
