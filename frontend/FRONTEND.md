# Bingehive — Frontend

A web application built with Next.js, TypeScript and Tailwind CSS. Allows two users to manage a shared anime library with real-time updates, search, and personal ratings.

---

## Tech Stack

- **Next.js 15** — React framework with App Router
- **TypeScript** — type safety
- **Tailwind CSS v4** — styling
- **Zustand** — global state management (auth, search)
- **Framer Motion** — animations and page transitions
- **react-hot-toast** — toast notifications
- **react-icons** — icons
- **WebSockets** — real-time library updates

---

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Login (root)
│   ├── library/
│   │   └── page.tsx          # Shared library
│   ├── search/
│   │   └── page.tsx          # Anime search
│   ├── add/
│   │   └── page.tsx          # Add custom anime
│   └── settings/
│       └── page.tsx          # User settings
├── components/
│   ├── AnimeModal.tsx        # Anime detail modal (library + search)
│   ├── AuthInitializer.tsx   # Initializes auth state on load
│   ├── ConfirmDialog.tsx     # Reusable confirmation dialog
│   ├── Footer.tsx            # Footer
│   ├── NavBar.tsx            # Navigation bar
│   ├── PageTransition.tsx    # Framer Motion page wrapper
│   ├── ProtectedRoute.tsx    # Auth guard for protected pages
│   └── StarBackground.tsx    # Animated star canvas background
├── hooks/
│   └── useLibrarySocket.ts   # WebSocket hook for real-time updates
├── lib/
│   └── api.ts                # All API calls to backend
|   └── handleFunctions.ts    # Handle functions
├── store/
│   ├── authStore.ts          # Zustand auth store (user, token, login/logout)
│   └── searchStore.ts        # Zustand search store (query, results)
├── types/
│   └── index.ts              # TypeScript interfaces and types
└── utils/
    └── utils.ts              # Helper functions (getTitle, statusColor etc.)
```

---

## Pages

### Login (`/`)
Entry point for the app. Email and password form — on success redirects to `/library`. Shows error message on failed login.

### Library (`/library`)
Main page of the app. Shows:
- **Hero banner** with the currently watching anime and a Randomize Next button
- **Filter menu** to filter by status (Plan to Watch, Completed, On Hold, Dropped)
- **Anime grid** sorted alphabetically within each status group
- Clicking an anime card opens the **AnimeModal**
- Delete button on each card with a confirmation dialog

### Search (`/search`)
- Search field — searches by title or genre
- Loads 25 popular anime on first visit
- Results display as cards with score, genres and an add button
- Clicking a card opens the **AnimeModal** in search mode (no status/rating/notes)
- Search state persists when switching between pages (Zustand)

### Add (`/add`)
Form for adding a custom anime that isn't in the MAL database:
- Title (required)
- Total episodes (optional)
- Cover art URL (optional, must be a valid image URL ending in jpg/png/webp/gif over https)

### Settings (`/settings`)
- Upload profile picture (stored in Supabase Storage)
- Change email address
- Change password (requires current password, min 8 chars, 1 uppercase, 1 number)

---

## Components

### `AnimeModal`
Opens when clicking an anime card. Has two modes:

**Library mode** (`mode='library'`)
- Full anime details from MAL API
- Status selector (watching/plan_to_watch/completed/on_hold/dropped)
- Personal star rating (1–5) — saves automatically
- Private notes — saves automatically
- Streaming links via AniList
- Swap dialog when trying to set a second anime to "watching"

**Search mode** (`mode='search'`)
- Full anime details from MAL API
- Streaming links via AniList
- Add to Library button
- No status/rating/notes

### `ProtectedRoute`
Wraps all pages except login. Waits for auth to initialize (`isInitialized`) before redirecting to `/` if no user is found.

### `ConfirmDialog`
Reusable dialog component used for:
- Delete confirmation
- Swap watching confirmation (via `children` prop for custom content)

### `useLibrarySocket`
Custom hook that opens a WebSocket connection to `ws://127.0.0.1:8000/ws/library`. Calls a callback whenever the backend broadcasts an event:

| Event type | Trigger |
|---|---|
| `anime_added` | Someone added an anime |
| `anime_removed` | Someone removed an anime |
| `status_changed` | Someone changed a watch status |
| `userdata_changed` | Someone updated rating/notes |

Used in both `library/page.tsx` and `search/page.tsx` to keep UI in sync in real time.

---

## State Management

### `authStore` (Zustand + persist)
Persists `token` in localStorage. On page load, `AuthInitializer` checks if a token exists and calls `fetchUser` to restore the session.

| State | Description |
|---|---|
| `user` | Current user object |
| `token` | JWT access token |
| `isLoading` | True while fetching user |
| `isInitialized` | True once auth check is complete |

### `searchStore` (Zustand)
Keeps search state alive when navigating between pages.

| State | Description |
|---|---|
| `query` | Current search input |
| `results` | Last search results |
| `lastQuery` | Label shown above results |

---

## API

All calls go through `lib/api.ts`. Every response passes through `handleResponse` which:
- Logs out and redirects to `/` on `401 Unauthorized`
- Throws a typed error with `existing_anime_id` on `409 Conflict` (used for watching swap)

The base URL defaults to `http://127.0.0.1:8000` or reads from `NEXT_PUBLIC_API_URL`.

---

## Utilities (`utils/utils.ts`)

| Function / constant | Description |
|---|---|
| `getTitle(anime)` | Returns `title_en` if available, otherwise `title` |
| `statusColor` | Tailwind text color class per status |
| `statusBgColor` | Background color per status (used in modal) |
| `genreMap` | Map of genre names to MAL genre IDs |

---

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

For production, update this to your deployed backend URL.
