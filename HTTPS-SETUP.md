# HTTPS Setup Guide for torque-app

## Prerequisites
- Domain name: `torque.dbsurplus.info`
- DNS pointing to your server's IP
- Port 80 accessible from the internet
- Certbot installed (✓ already installed)

## Quick Setup (Recommended - Using Certbot Nginx Plugin)

Certbot can automatically configure nginx for you. Here's the easiest way:

### Step 1: Fix port conflicts
```bash
# Disable conflicting sites
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl start nginx
```

### Step 2: Update nginx config for HTTP (temporary)
```bash
# Copy the updated config (with HTTPS sections)
sudo cp /home/whatcheer/torque-app/nginx-torque-app.conf /etc/nginx/sites-available/torque-app

# Edit it to comment out SSL lines temporarily
sudo nano /etc/nginx/sites-available/torque-app
# Comment out lines starting with ssl_certificate, ssl_certificate_key, ssl_trusted_certificate
# Change "listen 443 ssl http2;" to "listen 443;"
```

### Step 3: Let Certbot automatically configure SSL
```bash
# Certbot will modify your nginx config automatically
sudo certbot --nginx -d torque.dbsurplus.info

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommend: Yes)
```

That's it! Certbot will automatically:
- Obtain the SSL certificate
- Configure nginx with SSL settings
- Set up automatic renewal

---

## Manual Setup (Alternative)

If you prefer full control, follow these steps:

### Step 1: Ensure HTTP config works first
```bash
# Fix port conflicts
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl start nginx
```

### Step 2: Get SSL certificate
```bash
# Create certbot directory
sudo mkdir -p /var/www/certbot

# Get certificate (webroot method)
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d torque.dbsurplus.info \
    --email your-email@example.com \
    --agree-tos
```

### Step 3: Update nginx config
```bash
# Copy the HTTPS config
sudo cp /home/whatcheer/torque-app/nginx-torque-app.conf /etc/nginx/sites-available/torque-app
```

### Step 4: Test and reload
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Verify HTTPS works
```bash
curl -I https://torque.dbsurplus.info
```

---

## Auto-Renewal

Certbot should automatically set up a renewal cron job. Verify it exists:
```bash
sudo systemctl status certbot.timer
# Or check crontab
sudo crontab -l | grep certbot
```

Test renewal (dry run):
```bash
sudo certbot renew --dry-run
```

---

## Troubleshooting

### Port 80 conflict
```bash
# Check what's using port 80
sudo lsof -i :80
sudo ss -tlnp | grep :80

# Stop conflicting services
sudo systemctl stop apache2  # if Apache is running
```

### Certificate not found
- Verify DNS is pointing correctly: `dig torque.dbsurplus.info`
- Ensure port 80 is accessible
- Check firewall: `sudo ufw status`

### Nginx won't start
```bash
# Check syntax
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Security Notes

The configuration includes:
- ✅ TLS 1.2 and 1.3 only
- ✅ Strong cipher suites
- ✅ HSTS header (forces HTTPS)
- ✅ OCSP stapling
- ✅ Security headers (XSS protection, frame options, etc.)








