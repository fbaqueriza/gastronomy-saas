# Gastronomy SaaS Platform

A comprehensive bilingual (English/Spanish) SaaS platform for gastronomy businesses to manage providers, orders, stock, and payments.

## 🚀 **Live Deployment Options**

### **Option 1: Vercel (Recommended)**

**Step 1: Prepare Your Repository**
```bash
# Ensure your code is in a Git repository
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   ```
5. Click "Deploy"

**Step 3: Custom Domain (Optional)**
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `gastronomy-saas.com`)
4. Update DNS records as instructed

### **Option 2: Netlify**

**Step 1: Build Configuration**
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Step 2: Deploy**
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your `.next` folder or connect GitHub
3. Configure build settings
4. Deploy

### **Option 3: Railway**

**Step 1: Prepare for Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

**Step 2: Deploy**
```bash
# Initialize Railway project
railway init

# Deploy
railway up
```

### **Option 4: DigitalOcean App Platform**

**Step 1: Prepare App Spec**
Create `.do/app.yaml`:
```yaml
name: gastronomy-saas
services:
- name: web
  source_dir: /
  github:
    repo: your-username/gastronomy-saas
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

**Step 2: Deploy**
1. Go to DigitalOcean App Platform
2. Create new app from GitHub
3. Configure build settings
4. Deploy

## 🔧 **Environment Variables**

Create `.env.local` for local development:
```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Database (if using external DB)
DATABASE_URL=your-database-url
```

## 📦 **Build & Deploy Commands**

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🌐 **Custom Domain Setup**

### **DNS Configuration**

**For Vercel:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**For Netlify:**
```
Type: CNAME
Name: @
Value: your-app.netlify.app
```

### **SSL Certificate**
- Vercel: Automatic SSL
- Netlify: Automatic SSL
- Railway: Automatic SSL
- DigitalOcean: Automatic SSL

## 🔒 **Security Considerations**

1. **Environment Variables**: Never commit sensitive data
2. **API Keys**: Use environment variables for all API keys
3. **CORS**: Configure CORS for your domain
4. **Rate Limiting**: Implement rate limiting for API routes
5. **HTTPS**: Always use HTTPS in production

## 📊 **Performance Optimization**

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatic with Next.js
3. **Caching**: Implement proper caching headers
4. **CDN**: Use Vercel's edge network or similar

## 🚨 **Troubleshooting**

### **Common Issues:**

**Build Failures:**
```bash
# Clear cache
rm -rf .next
npm run build
```

**Environment Variables:**
- Ensure all required env vars are set in hosting platform
- Check for typos in variable names

**Domain Issues:**
- Verify DNS records are correct
- Wait for DNS propagation (up to 48 hours)

**Performance Issues:**
- Check bundle size: `npm run analyze`
- Optimize images and assets
- Enable compression

## 📈 **Monitoring & Analytics**

### **Recommended Tools:**
1. **Vercel Analytics** (if using Vercel)
2. **Google Analytics**
3. **Sentry** for error tracking
4. **Uptime Robot** for monitoring

### **Setup Google Analytics:**
```bash
npm install @next/third-parties
```

Add to `layout.tsx`:
```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

## 💰 **Cost Estimation**

### **Monthly Costs:**
- **Vercel**: $0 (Hobby) → $20 (Pro)
- **Netlify**: $0 (Starter) → $19 (Pro)
- **Railway**: $5 (Hobby) → $20 (Pro)
- **DigitalOcean**: $5 (Basic) → $12 (Professional)

### **Domain Costs:**
- **Domain Registration**: $10-15/year
- **SSL Certificate**: Free (Let's Encrypt)

## 🎯 **Next Steps After Deployment**

1. **Set up monitoring** and error tracking
2. **Configure backups** for your data
3. **Set up CI/CD** for automatic deployments
4. **Implement analytics** to track usage
5. **Create documentation** for your users
6. **Set up support system** (email, chat, etc.)

---

## 🏃‍♂️ **Quick Start**

```bash
# Clone the repository
git clone https://github.com/your-username/gastronomy-saas.git
cd gastronomy-saas

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

Your app will be live at `https://your-app.vercel.app` or your custom domain! 🚀
 