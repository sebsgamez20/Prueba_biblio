#!/usr/bin/env bash
# Script de construcción para Render

echo "🚀 Iniciando construcción en Render..."

# Instalar dependencias PHP
echo "📦 Instalando dependencias PHP..."
composer install --no-dev --optimize-autoloader

# Instalar dependencias Node.js
echo "📦 Instalando dependencias Node.js..."
npm install

# Construir assets
echo "🔨 Construyendo assets..."
npm run build

# Generar clave de aplicación si no existe
if [ ! -f .env ]; then
    echo "🔑 Generando archivo .env..."
    cp .env.example .env
    php artisan key:generate
fi

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
php artisan migrate --force

# Crear enlace simbólico para storage
echo "🔗 Creando enlace simbólico..."
php artisan storage:link

# Limpiar y cachear configuraciones
echo "⚡ Optimizando aplicación..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Construcción completada exitosamente!" 