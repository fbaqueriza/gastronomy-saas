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

## Automatizar la creación de usuarios en la tabla `users` (Postgres trigger)

Agrega este trigger y función en Supabase para que cada vez que se registre un usuario nuevo en Auth, se cree automáticamente en tu tabla `users`:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, created_at)
  values (new.id, new.email, now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Esto asegura que la relación foránea de `user_id` siempre apunte a un usuario existente.

## Contributing

This is a demo application showcasing a complete SaaS solution for gastronomy management.
 