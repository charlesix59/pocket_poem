#!/bin/bash
# EAS prebuild hook to generate database before build

set -e

echo "📦 Installing npm dependencies..."
npm install

echo "🔨 Generating database..."
npm run generate-db

echo "✅ Database generated successfully!"
