# Bingehive — Backend

A REST API built with FastAPI and Python. Handles authentication, anime search via the MyAnimeList API, streaming information via AniList, and manages a shared anime library stored in Supabase (PostgreSQL).

---

## Tech Stack

- **FastAPI** — web framework
- **SQLAlchemy** — database ORM
- **Supabase** — hosted PostgreSQL database
- **passlib/bcrypt** — password hashing
- **python-jose** — JWT tokens
- **httpx** — async HTTP client
- **slowapi** — rate limiting
- **Supabase Storage** — avatar image storage

---

## External APIs

**MyAnimeList API**
- Base URL: `https://api.myanimelist.net/v2`
- Requires `X-MAL-CLIENT-ID` header
- Used for: search, popular anime, anime details

**AniList API**
- Base URL: `https://graphql.anilist.co`
- No API key required, GraphQL
- Used for: streaming service links per anime

---

## Project Structure

```
backend/
├── core/
│   ├── config.py          # Environment variables
│   ├── dependencies.py    # Auth dependency (get_current_user)
│   ├── limiter.py         # Rate limiter
│   ├── security.py        # Password hashing and JWT
│   └── supabase.py        # Supabase storage client
├── routers/
│   ├── auth.py            # Login
│   ├── anime.py           # Search, details, streaming
│   ├── library.py         # Library management
│   └── users.py           # User settings
├── services/
│   ├── anime_client.py    # MAL API integration
│   └── anilist_client.py  # AniList GraphQL integration
├── database.py            # SQLAlchemy setup
├── models.py              # Database models
├── user_schema.py         # Response schemas
├── seed_users.py          # One-time user creation script
└── main.py                # App entry point
```
## Environment Variables

```env
DATABASE_URL= postgresql://...
JWT_SECRET= your-secret-key
JWT_ALGORITHM= HS256
JWT_EXPIRE_MINUTES= 60
MAL_CLIENT_ID= your-mal-client-id
SUPABASE_URL= https://your-project.supabase.co
SUPABASE_SERVICE_KEY= your-service-role-key

# Only needed for seed_users.py
USER1_EMAIL= user1@example.com
USER1_PASSWORD= password
USER1_USERNAME= User1
USER2_EMAIL= user2@example.com
USER2_PASSWORD= password
USER2_USERNAME= User2
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| email | text, unique | |
| password_hash | text | bcrypt |
| username | text, unique | |
| avatar_url | text, nullable | Supabase Storage URL |
| created_at | timestamptz | |

### `anime`
Local cache of MAL data. Shared between all users.

| Column | Type | Notes |
|---|---|---|
| id | integer (PK) | MAL anime ID (negative for custom) |
| title | text | Japanese title |
| title_en | text, nullable | English title |
| image_url | text, nullable | |
| synopsis | text, nullable | |
| episodes | integer, nullable | |
| mean_score | float, nullable | |
| cached_at | timestamptz | |

### `library_entries`
The shared library — one row per anime.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| anime_id | integer, unique (FK → anime.id) | |
| status | enum | watching / completed / plan_to_watch / dropped / on_hold |
| added_by | uuid (FK → users.id) | |
| updated_by | uuid (FK → users.id) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `user_anime_data`
Personal ratings and notes per user.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users.id) | |
| anime_id | integer (FK → anime.id) | |
| rating | integer (1–10), nullable | |
| notes | text, nullable | |
| updated_at | timestamptz | |
| | unique (user_id, anime_id) | |

---

## Authentication

No open registration — users are created via `seed_users.py`. Login returns a JWT which must be included in all protected requests:

```
Authorization: Bearer <token>
```

Tokens expire after 60 minutes. Login is rate limited to 5 requests/minute per IP.

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login with email/password, returns JWT |

**Login body:**
```json
{ "email": "user@example.com", "password": "yourpassword" }
```

---

### Anime

| Method | Endpoint | Description |
|---|---|---|
| GET | `/anime/search?q=naruto` | Search anime by title |
| GET | `/anime/popular` | Get 25 popular anime |
| GET | `/anime/{id}/details` | Get full details for one anime |
| GET | `/anime/{id}/streaming` | Get streaming links via AniList |

---

### Library

| Method | Endpoint | Description |
|---|---|---|
| GET | `/library/` | Get full library with anime data |
| POST | `/library/add` | Add anime by MAL ID (auto-fetches data) |
| POST | `/library/add-custom` | Add a custom anime manually |
| PATCH | `/library/{id}/status` | Update watch status |
| PATCH | `/library/{id}/userdata` | Update personal rating/notes |
| GET | `/library/{id}/userdata` | Get personal rating/notes |
| DELETE | `/library/{id}` | Remove anime from library |

**Add anime:**
```json
{ "mal_id": 21 }
```

**Update status:**
```json
{ "status": "watching" }
```
Valid values: `watching` `completed` `plan_to_watch` `dropped` `on_hold`

**Update userdata:**
```json
{ "rating": 8, "notes": "Great show!" }
```

---

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Get current user info |
| PATCH | `/users/update-email` | Change email |
| PATCH | `/users/update-password` | Change password |
| POST | `/users/avatar` | Upload profile picture |

**Password requirements:** min 8 characters, one uppercase letter, one number.

**Avatar:** JPEG, PNG or WebP, max 2MB. Stored in Supabase Storage.
