#!/bin/bash
set -e

echo "Waiting for database to be ready..."
# Wait for database to be ready
until python -c "import psycopg2; psycopg2.connect(host='database', user='admin', password='klnFe5oVOI1c6dn3Aub6hkBeI', dbname='mangawelt')" 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"

# Run migrations
echo "Running makemigrations..."
python manage.py makemigrations --noinput

echo "Running migrate..."
python manage.py migrate --noinput

# Start cron
echo "Starting cron..."
cron

# Execute the main command
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000

