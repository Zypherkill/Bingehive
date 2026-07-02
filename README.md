
# Bingehive 🎌

A private shared anime library for two users. Search for anime, build a shared watchlist, track status, and leave personal ratings and notes — all in real time.

---

## Overview

Bingehive is a full-stack web app with a FastAPI backend and a Next.js frontend. Both users share one library where watch status is visible to everyone, while ratings and notes are personal. Changes are reflected instantly across both sessions via WebSockets.

---

## Tech Stack

**Backend**
- Python, FastAPI, SQLAlchemy
- Supabase (PostgreSQL + Storage)
- MyAnimeList API (anime data)
- AniList API (streaming links)

**Frontend**
- Next.js 15, TypeScript, Tailwind CSS v4
- Zustand, Framer Motion, WebSockets

---

## Project Structure

```
bingehive/
├── backend/
│   ├── core/
│   ├── routers/
│   ├── services/
│   ├── models.py
│   ├── database.py
│   ├── main.py
│   ├── seed_users.py
│   └── BACKEND.md
└── frontend/
    ├── app/
    ├── components/
    ├── hooks/
    ├── lib/
    ├── store/
    ├── types/
    ├── utils/
    └── FRONTEND.md
```

For detailed documentation on each part, see:
- [`backend/BACKEND.md`](backend/BACKEND.md)
- [`frontend/FRONTEND.md`](frontend/FRONTEND.md)

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [MyAnimeList API](https://myanimelist.net/apiconfig) Client ID

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bingehive.git
cd bingehive
```

### 2. Set up the database

In your Supabase project, go to **SQL Editor** and run:

```sql
create extension if not exists "pgcrypto";

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  username text unique not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table anime (
  id integer primary key,
  title text not null,
  title_en text,
  image_url text,
  synopsis text,
  episodes integer,
  mean_score real,
  genres jsonb,
  raw_data jsonb,
  cached_at timestamptz not null default now()
);

create type library_status as enum (
  'watching', 'completed', 'plan_to_watch', 'dropped', 'on_hold'
);

create table library_entries (
  id uuid primary key default gen_random_uuid(),
  anime_id integer not null unique references anime(id) on delete cascade,
  status library_status not null default 'plan_to_watch',
  added_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_by uuid not null references users(id),
  updated_at timestamptz not null default now()
);

create table user_anime_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  anime_id integer not null references anime(id) on delete cascade,
  rating integer check (rating between 1 and 10),
  notes text,
  updated_at timestamptz not null default now(),
  unique (user_id, anime_id)
);
```

Also create a **Storage bucket** named `avatars` and set it to **Public**.

### 3. Set up the backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary python-dotenv "passlib[bcrypt]==4.0.1" "python-jose[cryptography]" httpx slowapi supabase
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://postgres.your-ref:your-password@aws-x.pooler.supabase.com:5432/postgres
JWT_SECRET=your-generated-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
MAL_CLIENT_ID=your-mal-client-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ALLOW_ORIGINS=your-vercel-link

USER1_EMAIL=user1@example.com
USER1_PASSWORD=password
USER1_USERNAME=User1
USER2_EMAIL=user2@example.com
USER2_PASSWORD=password
USER2_USERNAME=User2
```

Generate a secure JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Seed the two users (run once):
```bash
python seed_users.py
```

Start the backend:
```bash
uvicorn main:app --reload
```

### 4. Set up the frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
Change to vercel url later

Start the frontend:
```bash
npm run dev
```

App available at `http://localhost:3000`.

---

## Features

- 🔐 **Auth** — email/password login with JWT, session persists on reload
- 📚 **Shared library** — one library for both users, status visible to all
- 🎲 **Randomize Next** — picks a random "Plan to Watch" anime and sets it to watching
- 🔍 **Search** — search by title, browse popular anime
- 📺 **Streaming links** — see where to watch each anime via AniList
- ⭐ **Personal ratings** — private 1–5 star rating and notes per anime
- ➕ **Custom anime** — add titles not in the MAL database
- 🔄 **Real-time updates** — status changes and additions sync instantly via WebSockets
- 🖼️ **Avatar upload** — profile picture stored in Supabase Storage

---

## Deployment

### Backend — Railway

1. Push your code to GitHub
2. Create a new project on [Railway](https://railway.app) or [Render](https://render.com)
3. Connect your GitHub repo and select the `backend/` folder
4. Add all environment variables from your `.env` file
5. Set the start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set the root directory to `frontend/`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url`
4. Deploy
