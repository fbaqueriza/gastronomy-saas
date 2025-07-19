@echo off
chcp 65001 >nul
echo 🚀 Gastronomy SaaS Deployment Script
echo =====================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    pause
    exit /b 1
)

REM Check if all dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build the project
echo 🔨 Building project...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Ask user for deployment platform
echo.
echo Choose your deployment platform:
echo 1) Vercel (Recommended for Next.js)
echo 2) Netlify
echo 3) Railway
echo 4) DigitalOcean App Platform
echo 5) Manual deployment instructions
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo 🚀 Deploying to Vercel...
    echo.
    echo Follow these steps:
    echo 1. Go to https://vercel.com and sign up/login
    echo 2. Click 'New Project'
    echo 3. Import your GitHub repository
    echo 4. Configure environment variables:
    echo    - NEXTAUTH_URL=https://your-domain.vercel.app
    echo    - NEXTAUTH_SECRET=your-secret-key
    echo 5. Click 'Deploy'
    echo.
    echo Or use Vercel CLI:
    echo npm install -g vercel
    echo vercel --prod
) else if "%choice%"=="2" (
    echo 🚀 Deploying to Netlify...
    echo.
    echo Follow these steps:
    echo 1. Go to https://netlify.com and sign up/login
    echo 2. Click 'New site from Git'
    echo 3. Connect your GitHub repository
    echo 4. Configure build settings:
    echo    - Build command: npm run build
    echo    - Publish directory: .next
    echo 5. Click 'Deploy site'
) else if "%choice%"=="3" (
    echo 🚀 Deploying to Railway...
    echo.
    echo Installing Railway CLI...
    npm install -g @railway/cli
    
    echo Follow these steps:
    echo 1. Run: railway login
    echo 2. Run: railway init
    echo 3. Run: railway up
    echo 4. Your app will be deployed automatically
) else if "%choice%"=="4" (
    echo 🚀 Deploying to DigitalOcean App Platform...
    echo.
    echo Follow these steps:
    echo 1. Go to https://cloud.digitalocean.com/apps
    echo 2. Click 'Create App'
    echo 3. Connect your GitHub repository
    echo 4. Configure build settings:
    echo    - Build command: npm run build
    echo    - Run command: npm start
    echo 5. Click 'Create Resources'
) else if "%choice%"=="5" (
    echo 📋 Manual Deployment Instructions
    echo ================================
    echo.
    echo 1. Build your project:
    echo    npm run build
    echo.
    echo 2. Upload the .next folder to your hosting provider
    echo.
    echo 3. Set up environment variables on your hosting platform
    echo.
    echo 4. Configure your domain and SSL certificate
    echo.
    echo 5. Start your application:
    echo    npm start
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment instructions completed!
echo.
echo Next steps:
echo 1. Set up your custom domain (optional)
echo 2. Configure SSL certificate
echo 3. Set up monitoring and analytics
echo 4. Test your application thoroughly
echo.
echo For more detailed instructions, see the README.md file.
pause 