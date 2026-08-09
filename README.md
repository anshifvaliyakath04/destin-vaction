# Destin Vacations - Next.js + Supabase

Migration of [destin.in](https://destin.in) from Express/MongoDB to **Next.js 16** + **Supabase** while preserving the original theme and functionality.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Email:** Nodemailer via Next.js API routes
- **Hosting:** Vercel / any Node.js host

## Prerequisites

1. Node.js 18+
2. npm or yarn
3. A Supabase project (https://supabase.com)

## Setup

### 1. Clone and install

```bash
cd destin-next
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Update `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

EMAIL_USER=Sales@destin.in
EMAIL_PASS=your-email-password
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false

NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=super_secret_destin_key_123

ADMIN_EMAIL=Sales@destin.in
ADMIN_PASSWORD=Admin@123
```

### 3. Run Supabase migrations

Go to your Supabase project > **SQL Editor** and run the SQL from:

```
supabase/migrations/20240101000000_initial_schema.sql
```

This creates:
- `profiles` table (extends auth.users)
- `trips` table
- `testimonials` table
- `settings` table
- `testimonial-images` storage bucket
- RLS policies

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for production

```bash
npm run build
npm run start
```

## Project Structure

```
destin-next/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # Login, signup, forgot/reset password
│   │   │   ├── admin/         # Admin CRUD for trips, testimonials, settings
│   │   │   ├── trips/         # Public trip booking
│   │   │   ├── testimonials/  # Public testimonial listing
│   │   │   └── settings/      # Public settings
│   │   ├── admin/page.tsx     # Admin dashboard
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── planner/page.tsx   # 6-step trip planner
│   │   ├── destination/page.tsx
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── supabase.ts        # Supabase clients
│   │   ├── email.ts           # Nodemailer helper
│   │   └── api-auth.ts        # Admin token auth helper
│   └── types/
│       └── supabase.ts        # TypeScript types
├── supabase/
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
├── .env.example
├── next.config.ts
└── package.json
```

## Migrated Features

- Homepage with hero, featured destinations, testimonials, stats
- 6-step trip planner (destination, dates, travelers, food, contact, summary)
- Destination detail pages
- User signup / login / forgot-password with OTP
- Admin dashboard (trips, testimonials, settings)
- Email notifications via SMTP
- WhatsApp floating button
- Responsive design matching original theme

## Notes

- Static assets are in `public/` (same as original `public/`)
- The original Express + MongoDB app remains in the root folder untouched
- Supabase Auth replaces the old JWT + bcrypt auth
- Admin bootstrap credentials are in `.env`
