#!/bin/bash
# Setup script for HTTPS with Let's Encrypt
# Run with: sudo ./setup-https.sh

set -e

DOMAIN="torque.dbsurplus.info"
CONFIG_FILE="/etc/nginx/sites-available/torque-app"
TEMP_CONFIG="/tmp/torque-app-http-only.conf"

echo "Setting up HTTPS for $DOMAIN..."

# Step 1: Create temporary HTTP-only config for certbot
echo "Creating temporary HTTP config for certificate validation..."
cat > "$TEMP_CONFIG" << 'EOF'
server {
    listen 80;
    server_name torque.dbsurplus.info;
    
    root /var/www/torque-app;
    index index.html;

    # Allow Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Handle client-side routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Logging
    access_log /var/log/nginx/torque-app-access.log;
    error_log /var/log/nginx/torque-app-error.log;
}
EOF

# Backup current config
echo "Backing up current config..."
cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"

# Copy temporary config
echo "Applying temporary HTTP config..."
cp "$TEMP_CONFIG" "$CONFIG_FILE"

# Ensure certbot directory exists
mkdir -p /var/www/certbot

# Test nginx config
echo "Testing nginx configuration..."
nginx -t

# Reload nginx
echo "Reloading nginx..."
systemctl reload nginx

# Step 2: Get SSL certificate
echo ""
echo "Obtaining SSL certificate from Let's Encrypt..."
echo "Make sure port 80 is accessible and DNS points to this server!"
read -p "Press Enter to continue or Ctrl+C to cancel..."

certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email admin@dbsurplus.info \
    --agree-tos \
    --non-interactive

# Step 3: Copy the full HTTPS config
echo ""
echo "Applying full HTTPS configuration..."
cp /home/whatcheer/torque-app/nginx-torque-app.conf "$CONFIG_FILE"

# Test nginx config again
echo "Testing HTTPS nginx configuration..."
nginx -t

# Reload nginx
echo "Reloading nginx with HTTPS..."
systemctl reload nginx

echo ""
echo "✓ HTTPS setup complete!"
echo "Your site should now be available at: https://$DOMAIN"
echo ""
echo "Certificate auto-renewal should be configured automatically."
echo "Test renewal with: sudo certbot renew --dry-run"


