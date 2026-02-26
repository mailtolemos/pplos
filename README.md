# pplos.io:// — Modern HR Platform

Production-ready multi-tenant HRIS built with Next.js 14, Supabase, and deployed on Vercel.

## Stack

- **Next.js 14** (App Router) — React framework
- **Supabase** — PostgreSQL + Auth + Row Level Security
- **Vercel** — Hosting with auto-deploy from GitHub
- **Recharts** — Analytics charts

## Setup (15 minutes)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name, password, and region (pick one close to your users)
3. Wait for the project to finish provisioning

### 2. Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/migrations/001_initial.sql`
3. Paste it into the SQL Editor and click **Run**
4. This creates all tables, indexes, RLS policies, and seed functions

### 3. Configure Supabase Auth

1. Go to **Authentication** → **Providers** → **Email**
2. Make sure "Enable Email Signup" is ON
3. **IMPORTANT**: For testing, go to **Authentication** → **Settings** and **disable** "Confirm email" (you can re-enable later)

### 4. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **anon/public key** (the long `eyJ...` string)

### 5. Create Environment File

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Install & Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the login page.

### 7. Create Your First Account

1. Click "Create workspace →"
2. Enter your name, company name, email, and password
3. This creates your tenant, profile, and seeds 10 demo employees
4. You'll be redirected to the dashboard

## Deploy to Vercel

### Option A: Push to GitHub + Connect Vercel (Recommended)

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit: pplos.io:// HRIS"

# Create a new repo on GitHub (github.com/new)
git remote add origin https://github.com/YOUR_USERNAME/peeps.git
git branch -M main
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) → "Add New Project"
2. Import your GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon key
4. Click **Deploy**

Done! Every `git push` to `main` will auto-deploy.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel --prod
# Follow the prompts, add env vars when asked
```

## How Auto-Deploy Works

```
You edit code → git push → GitHub → Vercel builds → Live in ~30s
```

- Push to `main` = production deploy
- Push to any other branch = preview deploy (unique URL)
- Every PR gets a preview URL automatically

## Project Structure

```
peeps/
├── src/
│   ├── app/
│   │   ├── layout.jsx          # Root layout (fonts, meta)
│   │   ├── page.jsx            # Root redirect
│   │   ├── login/page.jsx      # Auth: sign in
│   │   ├── signup/page.jsx     # Auth: create workspace
│   │   └── dashboard/
│   │       ├── layout.jsx      # Auth check + data provider
│   │       ├── page.jsx        # Dashboard home
│   │       ├── employees/      # Employee CRUD + profiles
│   │       ├── scheduling/     # Shift grid
│   │       ├── leave/          # Leave requests
│   │       ├── analytics/      # Charts + metrics
│   │       ├── performance/    # Review cycles
│   │       ├── workflows/      # Automation
│   │       ├── policies/       # Document management
│   │       └── settings/       # Tenant config
│   ├── components/
│   │   ├── ui.jsx              # Shared UI primitives
│   │   ├── data-provider.jsx   # Supabase data layer
│   │   └── dashboard-shell.jsx # Sidebar + header layout
│   ├── lib/supabase/
│   │   ├── client.js           # Browser Supabase client
│   │   └── server.js           # Server Supabase client
│   └── middleware.js            # Auth route protection
├── supabase/
│   └── migrations/
│       └── 001_initial.sql     # Full database schema
├── package.json
└── .env.local.example
```

## Architecture

### Multi-Tenant Data Isolation

Every table has a `tenant_id` column. PostgreSQL Row Level Security (RLS) ensures users can only see their tenant's data:

```sql
CREATE POLICY "Tenant isolation" ON employees
  FOR ALL USING (tenant_id = get_my_tenant_id());
```

The `get_my_tenant_id()` function looks up the current user's tenant from their profile.

### Auth Flow

1. **Signup**: Creates auth user → tenant → profile → seeds data
2. **Login**: Authenticates → middleware redirects to dashboard
3. **Dashboard**: Server layout checks auth → loads tenant → wraps in DataProvider
4. **Pages**: Client components use `useData()` hook for all CRUD

### Data Layer

The `DataProvider` context gives every page access to:
- All entity data (employees, leaves, shifts, etc.)
- CRUD functions that write to Supabase and update local state
- Analytics derived from current data
- Toast notifications

## Making Changes

1. Edit files in `src/`
2. Test locally with `npm run dev`
3. Commit and push:

```bash
git add .
git commit -m "feat: add new feature"
git push
```

4. Vercel auto-deploys in ~30 seconds

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

## License

MIT
