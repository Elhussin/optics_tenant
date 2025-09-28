FROM python:3.11-slim

WORKDIR /app

# تثبيت المتطلبات
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# جمع static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "osmBack.wsgi:application", "--bind", "0.0.0.0:8000"]
