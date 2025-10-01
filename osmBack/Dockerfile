# ========================================
# مرحلة البناء
# ========================================
FROM python:3.11-slim AS builder

WORKDIR /app

# تثبيت الأدوات المطلوبة للبناء
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# نسخ requirements
COPY requirements.txt .

# إنشاء virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# تثبيت الحزم
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ========================================
# مرحلة التشغيل
# ========================================
FROM python:3.11-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# نسخ الـ virtual environment
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# نسخ الكود
COPY . .

# إنشاء مجلد logs وصلاحياته
RUN mkdir -p /app/logs && chown -R 1001:1001 /app/logs

# إنشاء مستخدم غير root
RUN useradd -m -u 1001 django && chown -R django:django /app

USER django

# جمع الملفات الثابتة
RUN python manage.py collectstatic --noinput --clear || true

ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=optics_tenant.settings

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# استخدام gunicorn بدلاً من runserver في production
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "optics_tenant.wsgi:application"]
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
