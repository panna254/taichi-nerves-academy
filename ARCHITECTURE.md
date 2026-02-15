# Taichi Nerves Academy – Architecture

## Stack

- **Frontend:** TypeScript web app (Vite + React)
- **Backend & database:** Supabase (Auth, optional Database, Storage, Realtime)

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  TypeScript Web App (Vite + React)                          │
│  - src/pages/*, src/components/*, src/hooks/*                │
│  - Auth state: useAuth (synced from Supabase)                │
│  - User auth: userApi (Supabase Auth)                        │
│  - Admin auth: useAdminAuth (in-memory / separate flow)      │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             │ @supabase/supabase-js
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase                                                    │
│  - Auth: sign up, sign in, sign out, session, JWT            │
│  - Database: PostgreSQL (optional tables, e.g. profiles)    │
│  - Storage / Realtime: optional                              │
└─────────────────────────────────────────────────────────────┘
```

## Auth & user data

- **User emails and passwords** are stored and validated by **Supabase Auth** only.
- No custom auth server; no direct REST auth endpoints in this repo.
- Frontend uses `@supabase/supabase-js`:
  - `src/lib/supabase.ts` – Supabase client
  - `src/config/supabase.ts` – `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - `src/services/userApi.ts` – login, signup, logout, getCurrentUser (all via Supabase Auth)
  - `src/hooks/useAuth.tsx` – React auth state, synced from Supabase session and `onAuthStateChange`

## Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. In the project: **Project Settings → API** copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
3. In the app root, copy `.env.example` to `.env` and set these variables.

## Supabase setup (Auth)

- **Authentication → Providers:** enable Email (and any others you need).
- **Authentication → URL Configuration:** set Site URL and Redirect URLs to your app origin(s).
- Passwords are hashed and stored by Supabase; no custom password storage.

## Optional: Database (e.g. profiles)

To store extra user fields (e.g. display name, membership):

1. In Supabase SQL Editor, create a table, e.g.:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  membership_status text default 'active',
  membership_expires_at timestamptz,
  updated_at timestamptz default now()
);

-- Optional: RLS and trigger to create profile on signup
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

2. In the app, use `supabase.from('profiles')` for reads/writes and keep using Supabase Auth for login/signup.

## Key files

| Path | Purpose |
|------|--------|
| `src/config/supabase.ts` | Supabase URL and anon key from env |
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/services/userApi.ts` | User auth (Supabase Auth) + user mapping |
| `src/hooks/useAuth.tsx` | Auth context and Supabase session sync |
| `src/types/user.ts` | User and auth session types |

## Admin auth

Admin dashboard auth is separate: `useAdminAuth` and `adminApi` are in-memory/mock. To back admin by Supabase you could add an `admin` role in `auth.users` or a custom table and guard admin routes by that role.
