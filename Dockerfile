# Imagen base oficial con PHP, Composer y extensiones
FROM composer:2.5 as build

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del proyecto
COPY . .

# Instala dependencias de PHP
RUN composer install --no-dev --optimize-autoloader

# Instala dependencias de Node y genera assets
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    npm install && npm run build

# Etapa final: usa una imagen de Laravel optimizada
FROM php:8.2-fpm

# Instala extensiones necesarias
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip git curl && \
    docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instala Composer
COPY --from=build /usr/bin/composer /usr/bin/composer

# Copia el código final
COPY --from=build /app /var/www/html

# Da permisos adecuados
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# Establece directorio de trabajo
WORKDIR /var/www/html

# Expone el puerto 8000 para Laravel
EXPOSE 8000

# Comando para correr el servidor
CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan serve --host=0.0.0.0 --port=8000
