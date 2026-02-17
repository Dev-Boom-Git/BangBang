#!/bin/bash
# ============================================================
# BangBang Bakery — GCE Deployment Script
# Run this on a fresh Ubuntu 22.04 VM
# Usage: sudo bash scripts/deploy.sh
# ============================================================

set -e

APP_DIR="/var/www/bangbang"
DB_NAME="bangbang"
DB_USER="bangbang_user"
DB_PASS="BangBang_Str0ng_P@ss!"  # <-- CHANGE THIS!
JWT_SECRET="bangbang-jwt-prod-$(openssl rand -hex 16)"

echo ""
echo "🍞 ========================================"
echo "   BangBang Bakery — Server Setup"
echo "   ========================================"
echo ""

# ──── 1. System Update ──────────────────────────
echo "📦 [1/8] Updating system..."
apt update && apt upgrade -y

# ──── 2. Install Node.js 20 ─────────────────────
echo "📦 [2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "   ✅ Node $(node -v) / npm $(npm -v)"

# ──── 3. Install MySQL 8 ────────────────────────
echo "📦 [3/8] Installing MySQL..."
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# Create database and user
mysql -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "   ✅ MySQL ready — DB: ${DB_NAME}, User: ${DB_USER}"

# ──── 4. Install Nginx ──────────────────────────
echo "📦 [4/8] Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# ──── 5. Install PM2 ────────────────────────────
echo "📦 [5/8] Installing PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root

# ──── 6. Setup App ──────────────────────────────
echo "📦 [6/8] Setting up application..."
mkdir -p ${APP_DIR}
mkdir -p ${APP_DIR}/public/uploads/products
mkdir -p ${APP_DIR}/public/uploads/slips
mkdir -p ${APP_DIR}/public/uploads/settings

# If running from project dir, copy files
if [ -f "./package.json" ]; then
    echo "   Copying files from current directory..."
    rsync -av --exclude='node_modules' --exclude='.next' --exclude='.env.local' ./ ${APP_DIR}/
else
    echo "   ⚠️  No project files found. Please copy your project to ${APP_DIR}"
    echo "   Example: scp -r ./BangBang/* user@VM_IP:${APP_DIR}/"
fi

# Create .env.local for production
cat > ${APP_DIR}/.env.local << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=${JWT_SECRET}
NEXT_PUBLIC_API_URL=http://$(curl -s ifconfig.me)
EOF

cd ${APP_DIR}

echo "   Installing dependencies..."
npm install --production=false

echo "   Building Next.js..."
npm run build

echo "   Seeding database..."
node scripts/seed.js
node scripts/fix-images.js

# ──── 7. Configure Nginx ────────────────────────
echo "📦 [7/8] Configuring Nginx..."
cp ${APP_DIR}/nginx/bangbang.conf /etc/nginx/sites-available/bangbang
ln -sf /etc/nginx/sites-available/bangbang /etc/nginx/sites-enabled/bangbang
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ──── 8. Start App ──────────────────────────────
echo "📦 [8/8] Starting application..."
cd ${APP_DIR}
pm2 start ecosystem.config.js
pm2 save

# ──── Done! ─────────────────────────────────────
VM_IP=$(curl -s ifconfig.me)

echo ""
echo "🎉 ========================================"
echo "   Deployment Complete!"
echo "   ========================================"
echo ""
echo "   🌐 Website:  http://${VM_IP}"
echo "   🔐 Admin:    admin@bangbang.com / admin123"
echo "   👤 Customer: somchai@example.com / password123"
echo ""
echo "   📋 Useful Commands:"
echo "   pm2 status          — Check app status"
echo "   pm2 logs bangbang   — View logs"
echo "   pm2 restart all     — Restart app"
echo ""
echo "   ⚠️  IMPORTANT: Change these in .env.local:"
echo "   - DB_PASSWORD"
echo "   - JWT_SECRET"
echo "   - Admin password (via the app)"
echo "   ========================================"
