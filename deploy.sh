#!/bin/bash

# Deployment script for torque-app
# Builds both extension and PWA, commits to git, and deploys to web server
# Run with: ./deploy.sh (sudo is only needed for the deployment step)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SOURCE_DIR="$SCRIPT_DIR/dist"
TARGET_DIR="/var/www/torque-app"
USER="www-data"
GROUP="www-data"

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

echo "=========================================="
echo "Torque App Deployment Script"
echo "Version: $VERSION"
echo "=========================================="
echo ""

# Step 1: Build extension
echo "Step 1: Building extension..."
npm run build:extension
echo "✓ Extension build complete"
echo ""

# Step 2: Build PWA (for web deployment)
echo "Step 2: Building PWA for web deployment..."
npm run build
echo "✓ PWA build complete"
echo ""

# Step 3: Check git status
echo "Step 3: Checking git status..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Staging all changes..."
    git add -A
    
    echo "Committing changes with version $VERSION..."
    git commit -m "Release version $VERSION: Responsive sizing improvements for desktop and mobile"
    
    echo "✓ Changes committed to git"
else
    echo "No changes to commit"
fi
echo ""

# Step 4: Create git tag (optional, but good practice)
if ! git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "Step 4: Creating git tag v$VERSION..."
    git tag "v$VERSION"
    echo "✓ Tag v$VERSION created"
else
    echo "Step 4: Tag v$VERSION already exists, skipping..."
fi
echo ""

# Step 5: Deploy to web server (requires sudo)
echo "Step 5: Deploying to $TARGET_DIR (requires sudo)..."
echo "You may be prompted for your password."

# Create target directory if it doesn't exist
sudo mkdir -p "$TARGET_DIR"

# Copy all files from dist to target
echo "Copying files..."
sudo cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"

# Set proper ownership
echo "Setting ownership to $USER:$GROUP..."
sudo chown -R "$USER:$GROUP" "$TARGET_DIR"

# Set proper permissions
echo "Setting permissions..."
sudo find "$TARGET_DIR" -type d -exec chmod 755 {} \;
sudo find "$TARGET_DIR" -type f -exec chmod 644 {} \;

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "Version: $VERSION"
echo "Files deployed to: $TARGET_DIR"
echo "=========================================="
sudo ls -lah "$TARGET_DIR" | head -20










