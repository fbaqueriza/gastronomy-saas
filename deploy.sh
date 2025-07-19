#!/bin/bash

# Gastronomy SaaS Deployment Script
# This script helps you deploy your app to various platforms

echo "🚀 Gastronomy SaaS Deployment Script"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if all dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Ask user for deployment platform
echo ""
echo "Choose your deployment platform:"
echo "1) Vercel (Recommended for Next.js)"
echo "2) Netlify"
echo "3) Railway"
echo "4) DigitalOcean App Platform"
echo "5) Manual deployment instructions"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        echo ""
        echo "Follow these steps:"
        echo "1. Go to https://vercel.com and sign up/login"
        echo "2. Click 'New Project'"
        echo "3. Import your GitHub repository"
        echo "4. Configure environment variables:"
        echo "   - NEXTAUTH_URL=https://your-domain.vercel.app"
        echo "   - NEXTAUTH_SECRET=your-secret-key"
        echo "5. Click 'Deploy'"
        echo ""
        echo "Or use Vercel CLI:"
        echo "npm install -g vercel"
        echo "vercel --prod"
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        echo ""
        echo "Follow these steps:"
        echo "1. Go to https://netlify.com and sign up/login"
        echo "2. Click 'New site from Git'"
        echo "3. Connect your GitHub repository"
        echo "4. Configure build settings:"
        echo "   - Build command: npm run build"
        echo "   - Publish directory: .next"
        echo "5. Click 'Deploy site'"
        ;;
    3)
        echo "🚀 Deploying to Railway..."
        echo ""
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
        
        echo "Follow these steps:"
        echo "1. Run: railway login"
        echo "2. Run: railway init"
        echo "3. Run: railway up"
        echo "4. Your app will be deployed automatically"
        ;;
    4)
        echo "🚀 Deploying to DigitalOcean App Platform..."
        echo ""
        echo "Follow these steps:"
        echo "1. Go to https://cloud.digitalocean.com/apps"
        echo "2. Click 'Create App'"
        echo "3. Connect your GitHub repository"
        echo "4. Configure build settings:"
        echo "   - Build command: npm run build"
        echo "   - Run command: npm start"
        echo "5. Click 'Create Resources'"
        ;;
    5)
        echo "📋 Manual Deployment Instructions"
        echo "================================"
        echo ""
        echo "1. Build your project:"
        echo "   npm run build"
        echo ""
        echo "2. Upload the .next folder to your hosting provider"
        echo ""
        echo "3. Set up environment variables on your hosting platform"
        echo ""
        echo "4. Configure your domain and SSL certificate"
        echo ""
        echo "5. Start your application:"
        echo "   npm start"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment instructions completed!"
echo ""
echo "Next steps:"
echo "1. Set up your custom domain (optional)"
echo "2. Configure SSL certificate"
echo "3. Set up monitoring and analytics"
echo "4. Test your application thoroughly"
echo ""
echo "For more detailed instructions, see the README.md file." 