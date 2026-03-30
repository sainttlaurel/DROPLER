#!/bin/bash

# DROPLER Quick Setup Script
# This script helps you get DROPLER running quickly

echo "🚀 DROPLER Quick Setup"
echo "====================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your actual values:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - Stripe keys (optional for testing)"
    echo ""
    read -p "Press Enter after you've updated .env.local..."
else
    echo "✅ .env.local found"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

echo "🗄️  Setting up database..."
echo "   Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generate failed"
    exit 1
fi

echo "   Pushing schema to database..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Database push failed. Check your DATABASE_URL in .env.local"
    exit 1
fi

echo "   Seeding database with demo data..."
npx prisma db seed

if [ $? -ne 0 ]; then
    echo "❌ Database seed failed"
    exit 1
fi

echo "✅ Database setup complete"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Open: http://localhost:3000"
echo "   3. Login with:"
echo "      Email: demo@dropler.com"
echo "      Password: demo123"
echo ""
echo "📖 For more details, see SETUP.md"
echo ""
