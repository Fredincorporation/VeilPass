#!/usr/bin/env bash
set -euo pipefail

# deploy-local-backend.sh
# Builds the Next.js app and starts it in production mode locally.

echo "Installing dependencies..."
npm ci

echo "Building Next.js app..."
npm run build

echo "Starting Next.js in production mode (PORT=${PORT:-3000})..."
# Uses next start which requires a production build
PORT=${PORT:-3000} \
  NODE_ENV=production \
  npm run start
