# DROPLER Quick Setup Script (PowerShell)
# This script helps you get DROPLER running quickly on Windows

Write-Host "🚀 DROPLER Quick Setup" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env.local exists
if (-not (Test-Path .env.local)) {
    Write-Host "⚠️  .env.local not found" -ForegroundColor Yellow
    Write-Host "📝 Creating .env.local from .env.example..." -ForegroundColor Cyan
    Copy-Item .env.example .env.local
    Write-Host "✅ Created .env.local" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env.local with your actual values:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL (PostgreSQL connection string)"
    Write-Host "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    Write-Host "   - Stripe keys (optional for testing)"
    Write-Host ""
    Read-Host "Press Enter after you've updated .env.local"
} else {
    Write-Host "✅ .env.local found" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "🗄️  Setting up database..." -ForegroundColor Cyan
Write-Host "   Generating Prisma Client..."
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generate failed" -ForegroundColor Red
    exit 1
}

Write-Host "   Pushing schema to database..."
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database push failed. Check your DATABASE_URL in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "   Seeding database with demo data..."
npx prisma db seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database seed failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database setup complete" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm run dev"
Write-Host "   2. Open: http://localhost:3000"
Write-Host "   3. Login with:"
Write-Host "      Email: demo@dropler.com"
Write-Host "      Password: demo123"
Write-Host ""
Write-Host "📖 For more details, see SETUP.md"
Write-Host ""
