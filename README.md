# Winter's Pet Sitting & House Cleaning — Client Manager

A mobile-first client management app for a solo pet-sitting and house-cleaning business. Built with **Next.js 16**, **Supabase**, and **Tailwind CSS**.

---

## Features

| Feature | Details |
|---|---|
| **Client Management** | Full CRUD with soft-delete. Clients tagged as Pet Sitting, House Cleaning, or Both |
| **Dynamic Forms** | Service-specific fields appear/hide based on service type. Multiple pets per client |
| **Search & Filter** | Filter by name and service type with instant results |
| **Calendar** | Weekly grid + agenda list view via React Big Calendar. Click a slot to create appointments |
| **Payment Tracking** | Text-based payment status (Unpaid / Pending / Paid) + notes per appointment |
| **Helper Account** | Owner can create a Helper who gets read/write access but no admin controls |
| **Mobile-First** | Fixed bottom nav, collapsible sections, 375px optimized, no horizontal scroll |
| **7-Day Sessions** | Supabase auth with persistent sessions via SSR cookies |

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Backend / Database:** Supabase (Postgres + Row Level Security)
- **Auth:** Supabase Auth (email/password)
- **Calendar:** React Big Calendar + date-fns
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Hosting:** Vercel (recommended)

---

## Deployment

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase/schema.sql`
3. Copy your **Project URL** and **Anon Key** from Settings → API

### 2. Configure Authentication

In your Supabase dashboard → Authentication → Settings:
- **Site URL:** `https://your-vercel-domain.vercel.app`
- **Redirect URLs:** `https://your-vercel-domain.vercel.app/**`
- Session expiry: Set to `604800` seconds (7 days)

### 3. Create Your Owner Account

Sign up through the app's login page. The first account is automatically assigned the `owner` role via the database trigger in `schema.sql`.

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set these environment variables in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your Supabase values
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema Overview

```
profiles          — Extends Supabase auth.users; stores role (owner/helper)
clients           — Core client records with service type, access codes, etc.
pets              — One-to-many: each client can have multiple pets
appointments      — Linked to clients; includes start/end time, payment status
```

All tables use **Row Level Security** (RLS). Owners and helpers can read/write clients and appointments. Only owners can delete/archive.

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Authenticated routes with bottom nav
│   │   ├── clients/          # List, detail, create, edit pages
│   │   ├── calendar/         # Appointment calendar
│   │   └── settings/         # Account & helper management
│   ├── login/                # Login page
│   └── layout.tsx
├── components/
│   ├── auth/                 # LoginForm
│   ├── calendar/             # AppointmentCalendar
│   ├── clients/              # ClientList, ClientCard, ClientForm, PetForm, DeleteClientButton
│   ├── layout/               # Header, BottomNav
│   ├── settings/             # SettingsClient
│   └── ui/                   # Button, Input, Select, Textarea, Badge, Modal, CollapsibleSection
├── lib/
│   ├── supabase/             # Browser + server Supabase clients
│   └── types.ts              # All TypeScript types
└── proxy.ts                  # Auth route guard (Next.js 16 proxy)
supabase/
└── schema.sql                # Full database schema with RLS policies
```

---

## Mobile Usage Tips

- **During a visit:** Clients → tap client → collapsible sections show pets, access codes, instructions
- **Quick call:** tap phone number on client detail to dial directly
- **Directions:** tap address to open in Google Maps
- **New appointment:** Calendar → tap any time slot in week view

---

## Helper Account

Helpers can:
- View all clients and their details
- Create and edit clients
- View and create appointments

Helpers **cannot**:
- Archive/delete clients
- Delete appointments
- Manage accounts

To create: Settings → Helper Account → fill in email/password → Create Helper Account.
