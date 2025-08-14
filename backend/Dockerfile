FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install Python deps
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy app code
COPY backend /app

EXPOSE 8000

# Migrate then serve with Gunicorn
CMD sh -c "python manage.py migrate && gunicorn api.wsgi:application --bind 0.0.0.0:8000 --workers 3"
