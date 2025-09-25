#!/bin/bash

# تعديل حسب المسار الحقيقي
PROJECT_DIR="/home/hussin/Desktop/learning/optics_tenant"
VENV_DIR="$PROJECT_DIR/venv"
SETTINGS_FILE="$PROJECT_DIR/optics_tenant/settings.py"

# Step 1: إضافة الدومينات إلى /etc/hosts
echo "🔧 Adding domains to /etc/hosts..."
HOST_ENTRIES="127.0.0.1 store1.localhost client1.localhost store1.local client1.local"
if ! grep -q "store1.localhost" /etc/hosts; then
    echo "$HOST_ENTRIES" | sudo tee -a /etc/hosts > /dev/null
    echo "✅ Hosts added."
else
    echo "ℹ️ Hosts already exist."
fi

# Step 2: تعديل ALLOWED_HOSTS
echo "🔧 Updating ALLOWED_HOSTS in settings.py..."
ALLOWED_LINE="ALLOWED_HOSTS = [\"127.0.0.1\", \"localhost\", \".localhost\", \"store1.local\", \"client1.local\"]"
sed -i "s/^ALLOWED_HOSTS.*/$ALLOWED_LINE/" "$SETTINGS_FILE"

# Step 3: تفعيل البيئة الافتراضية وتشغيل collectstatic
echo "⚙️ Running collectstatic..."
source "$VENV_DIR/bin/activate"
cd "$PROJECT_DIR"
python manage.py collectstatic --noinput

# Step 4: اختبار وضبط Nginx
echo "🔁 Restarting nginx..."
sudo nginx -t && sudo systemctl restart nginx

# Step 5: تشغيل Gunicorn
echo "🚀 Starting Gunicorn..."
exec gunicorn optics_tenant.wsgi:application --bind 127.0.0.1:8000
