# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:23-alpine AS frontend-builder

WORKDIR /src

# Copy both frontend and create backend/public dir for build output
COPY frontend/ ./frontend/
RUN mkdir -p backend/public

WORKDIR /src/frontend
RUN npm ci --ignore-scripts 2>/dev/null || npm install
RUN npm run build
# Build output: /src/backend/public/build/

# ============================================
# Stage 2: Install PHP Dependencies
# ============================================
FROM composer:2 AS composer-builder

WORKDIR /app

COPY backend/composer.json backend/composer.lock* ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

# ============================================
# Stage 3: Final Production Image
# ============================================
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    icu-dev \
    linux-headers \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        gd \
        intl \
        pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS linux-headers

# Create app directory
WORKDIR /app

# Copy PHP configuration
COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini

# Copy Nginx configuration
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
RUN rm -f /etc/nginx/http.d/default.conf.bak

# Copy Supervisor configuration
COPY docker/supervisord.conf /etc/supervisord.conf

# Copy entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy PHP dependencies from composer stage
COPY --from=composer-builder /app/vendor /app/vendor

# Copy backend source code
COPY backend/ /app/

# Copy built frontend assets
COPY --from=frontend-builder /src/backend/public/build /app/public/build

# Set permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

# Create nginx directories
RUN mkdir -p /run/nginx

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
