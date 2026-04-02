#!/bin/bash
# ============================================
# Kinneret Shield - Push to GitHub
# Run this from the kinneret-shield/ folder
# ============================================

set -e

echo "=== Kinneret Shield: Push to GitHub ==="
echo ""

# 1. Clean up nested .git from expo-app
if [ -d "expo-app/.git" ]; then
  echo "Removing nested .git from expo-app..."
  rm -rf expo-app/.git
fi

# 2. Initialize git if not already
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  git branch -M main
fi

# 3. Add remote
echo "Setting up GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/levi1225-levi/kinneret-shield.git

# 4. Stage all files
echo "Staging files..."
git add -A

# 5. Commit
echo "Creating initial commit..."
git commit -m "Initial commit: Kinneret Shield complete project

- Expo (React Native) management app with 5 role dashboards
- NestJS + Prisma + Supabase backend with 49 API endpoints
- ESP32-S3 PlatformIO firmware (12-state state machine)
- 3D enclosure CAD files and Zoo Design Studio prompts
- MicroSD card configuration files
- Complete build guide (Word document)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# 6. Push
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "=== Done! ==="
echo "Your repo: https://github.com/levi1225-levi/kinneret-shield"
echo ""
echo "=== Next: Deploy to Expo ==="
echo "1. cd expo-app"
echo "2. npm install -g eas-cli"
echo "3. eas login"
echo "4. eas build:configure"
echo "5. eas update --auto      (for Expo web/OTA updates)"
echo "6. eas build --platform android   (for APK)"
