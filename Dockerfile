# Etapa de construcción (instala PHP, Composer, Node, npm, y compila assets)
FROM php:8.2-cli-bullseye as build

# Instala dependencias del sistema
RUN apt-get update && apt-get install -y \
    git unzip curl libpng-dev libonig-dev libxml2-dev zip libzip-dev \
    libjpeg-dev libfreetype6-dev nodejs npm

# Instala Composer manualmente
RUN curl -sS https://getcomposer.org/installer | php && \
    mv composer.phar /usr/local/bin/composer

# Instala extensiones de PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl gd

# Directorio de trabajo
WORKDIR /app

# Copia todo el proyecto
COPY . .

# Instala dependencias PHP y JS
RUN composer install --no-dev --optimize-autoloader && \
    npm install && npm run build

# Etapa final para correr la app
FROM php:8.2-cli-bullseye

# Instala extensiones necesarias también aquí
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip git && \
    docker-php-ext-install pdo pdo_mysql mbstring exif pcntl gd

# Copia el proyecto construido
COPY --from=build /app /var/www/html

# Establece el directorio de trabajo
WORKDIR /var/www/html

# Expone el puerto 8000 (Laravel)
EXPOSE 8000

# Comando para correr Laravel
CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan serve --host=0.0.0.0 --port=8000
