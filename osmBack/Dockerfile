# 1️⃣ نبدأ من صورة Python الرسمية
FROM python:3.11-slim AS base

# 2️⃣ تعيين مجلد العمل داخل الحاوية
# هنا هنحط كل ملفات المشروع
WORKDIR /app

# 3️⃣ تثبيت المكتبات الأساسية المطلوبة (لتجنب مشاكل psycopg2 وغيره)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 4️⃣ نسخ ملف المتطلبات (requirements.txt) أولاً
# عشان لو اتغير محتواه بس، Docker يعيد خطوة التثبيت فقط
COPY requirements.txt /app/
# COPY requirements.txt /app/requirements.txt
# 5️⃣ تثبيت باكدجات Python
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -r requirements.txt
# 6️⃣ نسخ باقي المشروع (الكود)
COPY . /app/

# 7️⃣ فتح البورت اللي هيشغل عليه Django
EXPOSE 8000

# 8️⃣ الأمر الافتراضي لتشغيل السيرفر
# لو في production يفضل gunicorn بدل runserver
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
