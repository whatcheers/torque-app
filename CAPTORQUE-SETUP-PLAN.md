# Plan: Adding captorque.app to Nginx Server

## Current Server Configuration

### Server IPs:
- **IP 1: `94.130.53.81`** - Used by multiple sites
- **IP 2: `94.130.53.85`** - Used by multiple sites

### Existing Websites on IP 94.130.53.81:
1. **redditdev.cheesemonger.info** (Defunct - used as example template)
   - Type: Node.js application (proxy)
   - Document Root: `/var/www/redditdev.cheesemonger.info`
   - Proxy: `http://localhost:3201`
   - Status: ✅ Enabled (but defunct)

2. **eyesoffcr.org**
   - Status: ✅ Enabled

3. **pixelsmith.app**
   - Type: Static site
   - Document Root: `/var/www/magicmediaconverter`
   - Status: ✅ Enabled

4. **captorque.app**
   - Type: Node.js application (proxy) - based on redditdev example
   - Status: ❌ **Config exists but has WRONG content + NOT enabled**
   - Current issue: Config file contains `redditdev.cheesemonger.info` instead of `captorque.app`

### Existing Websites on IP 94.130.53.85:
1. **dbsurplus.info**
   - Type: Static site
   - Document Root: `/var/www/dbsurplus`
   - Status: ✅ Enabled

2. **clconstruct.net**
   - Status: ✅ Enabled

## Current Status of captorque.app

**Location:** `/etc/nginx/sites-available/captorque.app` exists but:
- ❌ Contains wrong `server_name` (says `redditdev.cheesemonger.info`)
- ❌ Not enabled (no symlink in `/etc/nginx/sites-enabled/`)
- ✅ Already configured to use IP `94.130.53.81` (correct)
- ✅ Already has HTTP and HTTPS server blocks structure

## Plan for captorque.app

### Step 1: Fix Nginx Configuration File
**Action:** Update `/etc/nginx/sites-available/captorque.app` to:
- Change `server_name` from `redditdev.cheesemonger.info` to `captorque.app`
- Change `root` from `/var/www/redditdev.cheesemonger.info` to `/var/www/captorque.app`
- Update all path references from `redditdev.cheesemonger.info` to `captorque.app`
- Update SSL certificate paths to point to `captorque.app` certificates (will be created in Step 4)
- Keep Node.js proxy configuration (proxy_pass to localhost:3201) - based on redditdev example

**Note:** The corrected config file is already created in the repository at `/home/whatcheer/torque-app/captorque.app`

### Step 2: Deploy Configuration to Server
**Actions:**
1. Create symlink: `sudo ln -s /etc/nginx/sites-available/captorque.app /etc/nginx/sites-enabled/captorque.app`
2. Test configuration: `sudo nginx -t`
3. If test passes, reload nginx: `sudo systemctl reload nginx`

### Step 4: Setup SSL Certificate
**Actions:**
1. **Verify DNS:** Ensure DNS points `captorque.app` to `94.130.53.81`
   ```bash
   dig captorque.app +short
   # Should return: cd /
   ```

2. **Ensure port 80 is accessible** for ACME challenge

3. **Obtain SSL certificate** using webroot method:
   ```bash
   sudo certbot certonly --webroot \
       -w /var/www/letsencrypt \
       -d captorque.app \
       --email admin@dbsurplus.info \
       --agree-tos \
       --non-interactive
   ```
   
   **OR** use certbot nginx plugin (recommended - automatically updates config):
   ```bash
   sudo certbot --nginx -d captorque.app
   ```
   
   The certbot nginx plugin will:
   - Automatically obtain the certificate
   - Update the nginx config with correct SSL paths
   - Test and reload nginx

4. **Verify certificate paths** in config (should be automatically updated by certbot):
   - `/etc/letsencrypt/live/captorque.app/fullchain.pem`
   - `/etc/letsencrypt/live/captorque.app/privkey.pem`

### Step 4: Create Document Root Directory
**Actions:**
1. Create directory: `sudo mkdir -p /var/www/captorque.app`
2. Set ownership: `sudo chown -R www-data:www-data /var/www/captorque.app`
3. Set permissions: `sudo chmod -R 755 /var/www/captorque.app`

### Step 5: Deploy Application Files
**For Node.js App (based on redditdev example):**
- Deploy application files to `/var/www/captorque.app`
- Ensure Node.js server is running on port `3201` (or update proxy_pass if different)
- Set up process manager (PM2/systemd) if needed
- Test proxy connection

### Step 6: Verify and Test
**Actions:**
1. Test HTTP redirect: `curl -I http://captorque.app`
2. Test HTTPS: `curl -I https://captorque.app`
3. Verify SSL certificate: `openssl s_client -connect captorque.app:443 -servername captorque.app`
4. Test in browser
5. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
6. Check access logs if configured

## Questions to Answer Before Implementation

1. **What port does the Node.js app run on?**
   - Currently configured for `localhost:3201` (based on redditdev example)
   - Update `proxy_pass` in config if different

2. **Where are the source files located?**
   - Need to know the deployment process
   - Is there a build script or deployment process?

3. **Does DNS already point captorque.app to 94.130.53.81?**
   - Required for SSL certificate generation
   - Can verify with: `dig captorque.app +short`

## Implementation Checklist

- [x] Create corrected nginx config file in repository (`/home/whatcheer/torque-app/captorque.app`)
- [ ] Copy corrected config to `/etc/nginx/sites-available/captorque.app`
- [ ] Enable site: Create symlink in `/etc/nginx/sites-enabled/`
- [ ] Test nginx configuration: `sudo nginx -t`
- [ ] Reload nginx: `sudo systemctl reload nginx` (HTTP will work, HTTPS will fail until cert is obtained)
- [ ] Verify DNS points `captorque.app` to `94.130.53.81`
- [ ] Create document root directory: `sudo mkdir -p /var/www/captorque.app`
- [ ] Set proper ownership: `sudo chown -R www-data:www-data /var/www/captorque.app`
- [ ] Set proper permissions: `sudo chmod -R 755 /var/www/captorque.app`
- [ ] Obtain SSL certificate: `sudo certbot --nginx -d captorque.app`
- [ ] Verify SSL certificate paths in config (certbot should update automatically)
- [ ] Test nginx configuration again: `sudo nginx -t`
- [ ] Reload nginx: `sudo systemctl reload nginx`
- [ ] Deploy application files to `/var/www/captorque.app`
- [ ] Ensure Node.js server is running on port 3201 (or update config if different)
- [ ] Verify site is accessible via HTTP (should redirect to HTTPS)
- [ ] Verify site is accessible via HTTPS
- [ ] Test SSL certificate validity
- [ ] Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

## Files to Modify

1. **`/etc/nginx/sites-available/captorque.app`** - Fix server_name and configuration
2. **`/etc/nginx/sites-enabled/captorque.app`** - Create symlink (enable site)
3. **`/home/whatcheer/torque-app/captorque.app`** - Update repository copy (optional, for version control)

## Quick Reference Commands

```bash
# Step 1: Copy corrected config and enable site
sudo cp /home/whatcheer/torque-app/captorque.app /etc/nginx/sites-available/captorque.app
sudo ln -s /etc/nginx/sites-available/captorque.app /etc/nginx/sites-enabled/captorque.app
sudo nginx -t
sudo systemctl reload nginx

# Step 2: Verify DNS
dig captorque.app +short
# Should return: 94.130.53.81

# Step 3: Create document root
sudo mkdir -p /var/www/captorque.app
sudo chown -R www-data:www-data /var/www/captorque.app
sudo chmod -R 755 /var/www/captorque.app

# Step 4: Obtain SSL certificate (recommended method - auto-updates config)
sudo certbot --nginx -d captorque.app

# Alternative: Manual webroot method (then manually update config)
# sudo certbot certonly --webroot -w /var/www/letsencrypt -d captorque.app --email admin@dbsurplus.info --agree-tos --non-interactive

# Step 5: Verify everything works
sudo nginx -t
sudo systemctl reload nginx
curl -I http://captorque.app
curl -I https://captorque.app
```

## Notes

- ✅ **Corrected config file created** in repository at `/home/whatcheer/torque-app/captorque.app`
- The config file at `/etc/nginx/sites-available/captorque.app` has wrong content and needs to be replaced
- IP assignment is correct (`94.130.53.81`)
- Based on redditdev.cheesemonger.info example (Node.js app with proxy to localhost:3201)
- SSL certificate paths in config will be automatically updated by `certbot --nginx`
- Consider backing up the current config before making changes: `sudo cp /etc/nginx/sites-available/captorque.app /etc/nginx/sites-available/captorque.app.backup`
