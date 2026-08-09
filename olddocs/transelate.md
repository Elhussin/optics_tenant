# 1. تثبيت gettext
sudo apt-get install gettext

# 2. إنشاء ملفات الترجمة
cd /home/hussin/code/optics_tenant/osmBack
pdm run python manage.py makemessages -l ar -l en

# 3. ترجمة الملفات (يدوياً)
# تحرير locale/ar/LC_MESSAGES/django.po

# 4. تجميع الترجمات
pdm run python manage.py compilemessages