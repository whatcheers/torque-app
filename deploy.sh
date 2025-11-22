#!/bin/bash

# Deployment script for torque-app
# Run with: sudo ./deploy.sh

set -e

SOURCE_DIR="/home/whatcheer/torque-app/dist"
TARGET_DIR="/var/www/torque-app"
USER="www-data"
GROUP="www-data"

echo "Deploying torque-app to $TARGET_DIR..."

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy all files from dist to target
echo "Copying files..."
cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"

# Set proper ownership
echo "Setting ownership to $USER:$GROUP..."
chown -R "$USER:$GROUP" "$TARGET_DIR"

# Set proper permissions
echo "Setting permissions..."
find "$TARGET_DIR" -type d -exec chmod 755 {} \;
find "$TARGET_DIR" -type f -exec chmod 644 {} \;

echo "Deployment complete!"
echo "Files are now in $TARGET_DIR"
ls -lah "$TARGET_DIR"










