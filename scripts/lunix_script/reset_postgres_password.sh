#!/bin/bash

echo "🔐 أدخل كلمة المرور الجديدة لمستخدم postgres:"
read -s NEW_PASSWORD
echo ""
echo "✅ جاري تعيين كلمة المرور..."

# تغيير كلمة المرور داخل PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '${NEW_PASSWORD}';"

# العثور على ملف pg_hba.conf تلقائيًا
PG_HBA=$(find /etc/postgresql/ -name pg_hba.conf)

# تعديل إعدادات الاتصال إلى md5
echo "🛠️ تعديل ملف pg_hba.conf..."
sudo sed -i 's/^\(local\s\+all\s\+all\s\+\).*/\1md5/' "$PG_HBA"
sudo sed -i 's/^\(host\s\+all\s\+all\s\+127\.0\.0\.1\/32\s\+\).*/\1md5/' "$PG_HBA"
sudo sed -i 's/^\(host\s\+all\s\+all\s\+::1\/128\s\+\).*/\1md5/' "$PG_HBA"

# إعادة تشغيل PostgreSQL
echo "🔁 إعادة تشغيل PostgreSQL..."
sudo systemctl restart postgresql

# التحقق النهائي
echo ""
echo "✅ تم تغيير كلمة المرور بنجاح!"
echo "🔑 يمكنك الآن الاتصال بـ PostgreSQL:"
echo "psql -h 127.0.0.1 -U postgres -W"

