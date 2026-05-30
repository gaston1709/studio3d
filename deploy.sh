#!/bin/bash
# deploy.sh - Despliegue seguro para S3D
set -e

echo "=========================================================="
echo "  S3D - Safe Deployer"
echo "=========================================================="

APP_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$APP_DIR"

# Preflight: .env recommended (PM2 can also inject env via ecosystem.config.cjs)
if [ ! -f ".env" ]; then
    echo "AVISO: .env no encontrado — PM2 usará env_production de ecosystem.config.cjs"
fi

# 1. Pull latest changes
echo "[1/7] Pulling changes from Git..."
git pull

# 2. Install dependencies
echo "[2/7] Installing dependencies..."
npm ci --production=false

# 3. Apply DB migrations
echo "[3/7] Applying Prisma migrations..."
npx prisma migrate deploy

# 4. Regenerate Prisma Client
echo "[4/7] Regenerating Prisma Client..."
npx prisma generate

# 5. Ensure persistent directories
echo "[5/7] Ensuring upload directories..."
mkdir -p uploads/carousel
mkdir -p uploads/orders

# 6. Build Next.js
echo "[6/7] Building Next.js..."
npm run build

# 7. Restart PM2
echo "[7/7] Restarting PM2 process..."
pm2 restart ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production

# Optional: update Nginx config
if [ -d "/etc/nginx/conf.d" ]; then
    echo "[nginx] Updating Nginx config (conf.d)..."
    sudo cp "$APP_DIR/infrastructure/nginx.conf" /etc/nginx/conf.d/s3d.conf
    sudo nginx -t && sudo systemctl reload nginx && echo "[nginx] Reloaded."
elif [ -d "/etc/nginx/sites-available" ]; then
    echo "[nginx] Updating Nginx config (sites-available)..."
    sudo cp "$APP_DIR/infrastructure/nginx.conf" /etc/nginx/sites-available/s3d.conf
    sudo ln -sf /etc/nginx/sites-available/s3d.conf /etc/nginx/sites-enabled/s3d.conf 2>/dev/null || true
    sudo nginx -t && sudo systemctl reload nginx && echo "[nginx] Reloaded."
fi

echo ""
echo "=========================================================="
echo "  DEPLOYMENT COMPLETE"
echo "  App running at http://localhost:3010"
echo "=========================================================="
