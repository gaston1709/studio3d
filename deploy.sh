#!/bin/bash
# deploy.sh - Despliegue seguro para S3D (THE IRON)
set -e

echo "=========================================================="
echo "🚀 S3D - Safe Deployer"
echo "=========================================================="

APP_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$APP_DIR"

# 1. Obtener cambios
echo "📥 Pulleando cambios de Git..."
git pull

# 2. Dependencias
echo "📦 Instalando dependencias (incluyendo nodemailer)..."
npm install

# 3. Base de Datos
echo "🔄 Sincronizando Esquema Prisma..."
npx prisma db push

echo "💎 Regenerando Prisma Client..."
npx prisma generate

# 4. Directorios de Sistema
echo "📁 Asegurando carpetas de persistencia..."
mkdir -p uploads

# 5. Construcción
echo "🏗️  Construyendo Aplicación Next.js..."
npm run build

# 6. Reiniciar Servicios con PM2
echo "♻️  Reiniciando proceso en PM2..."
pm2 restart ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production

# 7. Infraestructura (Opcional - Requiere sudo)
if [ -f "/etc/nginx/sites-available/s3d.conf" ] || [ -f "/etc/nginx/conf.d/s3d.conf" ]; then
    echo "📂 Actualizando configuración de Nginx..."
    sudo cp "$APP_DIR/infrastructure/nginx.conf" /etc/nginx/conf.d/s3d.conf 2>/dev/null || \
    sudo cp "$APP_DIR/infrastructure/nginx.conf" /etc/nginx/sites-available/s3d.conf
    sudo systemctl reload nginx
    echo "✅ Nginx recargado."
fi

echo "=========================================================="
echo "✅ DESPLIEGUE SEGURO COMPLETADO"
echo "=========================================================="
