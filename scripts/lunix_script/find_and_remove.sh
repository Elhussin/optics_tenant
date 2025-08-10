#!/bin/bash

if [ -z "$1" ]; then
    echo "⚠️ الاستخدام: $0 اسم_البرنامج"
    exit 1
fi

PROGRAM=$1

echo "🔍 البحث عن: $PROGRAM"

# البحث في apt
APT_RESULT=$(dpkg --list | grep -i "$PROGRAM")
if [ -n "$APT_RESULT" ]; then
    echo "✅ البرنامج موجود في apt:"
    echo "$APT_RESULT"
    echo "🗑 لحذفه:"
    echo "sudo apt purge $PROGRAM && sudo apt autoremove"
fi

# البحث في snap
SNAP_RESULT=$(snap list | grep -i "$PROGRAM")
if [ -n "$SNAP_RESULT" ]; then
    echo "✅ البرنامج موجود في snap:"
    echo "$SNAP_RESULT"
    echo "🗑 لحذفه:"
    echo "sudo snap remove $PROGRAM"
fi

# البحث في dpkg (ملفات deb)
DPKG_RESULT=$(dpkg --get-selections | grep -i "$PROGRAM")
if [ -n "$DPKG_RESULT" ] && [ -z "$APT_RESULT" ]; then
    echo "✅ البرنامج موجود عبر dpkg:"
    echo "$DPKG_RESULT"
    echo "🗑 لحذفه:"
    echo "sudo dpkg --purge $PROGRAM"
fi

if [ -z "$APT_RESULT" ] && [ -z "$SNAP_RESULT" ] && [ -z "$DPKG_RESULT" ]; then
    echo "❌ لم يتم العثور على البرنامج في apt أو snap أو dpkg."
fi

