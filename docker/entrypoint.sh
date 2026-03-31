#!/bin/sh
set -e

cd /app

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
while ! php -r "try { new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '3306'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo 'ok'; } catch (Exception \$e) { exit(1); }" 2>/dev/null; do
    sleep 1
done
echo "MySQL is ready."

# Laravel optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Ensure storage directories exist
php artisan storage:link 2>/dev/null || true

echo "Starting application..."
exec supervisord -c /etc/supervisord.conf
