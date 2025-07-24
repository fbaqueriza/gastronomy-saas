# Gastronomy SaaS Manager

A comprehensive SaaS application for gastronomy commerce managers, built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## 🚀 Latest Update
- ✅ All syntax errors fixed
- ✅ Spanish-only interface
- ✅ Ready for production deployment

## Features

### 🔐 Authentication
- Email/password authentication
- Google OAuth integration
- Mock Firebase implementation for demo

### 📊 Dashboard
- Overview of key metrics
- Quick access to all modules
- Recent activity feed

### 👥 Provider Management
- Complete provider database
- Import/export functionality
- PDF catalog upload and viewing
- Argentine banking information (CBU, Alias, CUIT/CUIL, Razón Social)

### 📦 Stock Management
- Inventory tracking
- Low stock alerts
- Restock frequency management
- Provider associations

### 📋 Order Management
- Create and manage orders
- WhatsApp integration (mocked)
- Order status tracking
- Receipt upload and data extraction

### 💰 Payment Management
- Payment tracking
- Invoice management
- Export functionality
- Due date monitoring

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase (mocked)
- **Database**: Local storage (demo)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

The app is automatically deployed to Vercel on every push to the master branch.

## Environment Variables

Copy `env.example` to `.env.local` and configure your Firebase settings (optional for demo).

## Variables de entorno necesarias

Crea un archivo `.env.local` (no lo subas a git) y define:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_supabase
```

Estas variables también deben configurarse en Vercel para producción.

## Contributing

This is a demo application showcasing a complete SaaS solution for gastronomy management.
 