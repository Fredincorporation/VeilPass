#!/bin/bash
# VeilPass Quick Start Script

echo "🚀 VeilPass Quick Start Setup"
echo "============================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Setup .env.local
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your configuration"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local with your contract addresses"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:3000"
echo ""
echo "🔨 Helpful commands:"
echo "  npm run dev                 # Start development server"
echo "  npm run build               # Build for production"
echo "  npm run contracts:compile   # Compile contracts"
echo "  npm run contracts:deploy    # Deploy to Base Sepolia"
echo "  npm run contracts:test      # Run contract tests"
echo ""
