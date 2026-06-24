# Backend Documentation

The Bingehive backend is a REST API built with FastAPI and Python. It handles authentication, anime search via the Jikan API, streaming information via the AniList API, and manages a shared anime library stored in a Supabase PostgreSQL database.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Anime](#anime)
  - [Library](#library)
  - [Users](#users)
- [External APIs](#external-apis)
- [Rate Limiting](#rate-limiting)
- [Password Validation](#password-validation)
- [CORS](#cors)

---

## Tech Stack

| Package | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | Web framework |
| [SQLAlchemy](https://www.sqlalchemy.org/) | ORM for database interaction |
| [Supabase](https://supabase.com/) | Hosted PostgreSQL database |
| [psycopg2](https://pypi.org/project/psycopg2/) | PostgreSQL driver for SQLAlchemy |
| [Jikan API](https://jikan.moe/) | Unofficial MyAnimeList API — anime search |
| [AniList API](https://anilist.gitbook.io/anilist-apiv2-docs/) | GraphQL API — streaming service links |
| [passlib + bcrypt](https://passlib.readthedocs.io/) | Password hashing |
| [python-jose](https://python-jose.readthedocs.io/) | JWT token creation and verification |
| [httpx](https://www.python-httpx.org/) | Async HTTP client for external API calls |
| [slowapi](https://github.com/laurentS/slowapi) | Rate limiting |
| [python-dotenv](https://pypi.org/project/python-dotenv/) | Environment variable loading |

---

## Project Structure

```
backend/
├── core/
│   ├── config.py          # Loads environment variables
│   ├── dependencies.py    # get_current_user FastAPI dependency
│   ├── limiter.py         # Rate limiter instance (slowapi)
│   └── security.py        # Password hashing and JWT logic
├── routers/
│   ├── auth.py            # Login endpoint
│   ├── anime.py           # Anime search and streaming endpoints
│   ├── library.py         # Shared library endpoints
│   └── users.py           # User management endpoints
├── services/
│   ├── anime_client.py    # Jikan API integration
│   └── anilist_client.py  # AniList GraphQL API integration
├── database.py            # SQLAlchemy engine, session, and Base
├── models.py              # SQLAlchemy ORM models
├── user_schema.py         # Pydantic response schemas
├── seed_users.py          # One-time script to create the two users
└── main.py                # FastAPI app entry point, middleware, routers
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- A [Supabase](https://supabase.com/) project with the database schema applied

### Installation

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary python-dotenv "passlib[bcrypt]==4.0.1" "python-jose[cryptography]" httpx slowapi

# Create .env file (see Environment Variables below)

# Seed the two users — run once only
python seed_users.py

# Start the development server
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.
Interactive Swagger docs are available at `http://127.0.0.1:8000/docs`.

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-x-eu-north-1.pooler.supabase.com:5432/postgres

JWT_SECRET=your-generated-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# Only needed for the initial seed_users.py run
USER1_EMAIL=user1@example.com
USER1_PASSWORD=user1password
USER1_USERNAME=User1

USER2_EMAIL=user2@example.com
USER2_PASSWORD=user2password
USER2_USERNAME=User2
```

Generate a secure `JWT_SECRET`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

> ⚠️ Never commit `.env` to version control. It is listed in `.gitignore`.

---

## Architecture Overview

The backend follows a layered architecture:

```
Request
   │
   ▼
Routers (auth, anime, library, users)
   │   Defines endpoints, validates request/response via Pydantic
   │
   ▼
Services (anime_client, anilist_client)
   │   Handles all external API communication (Jikan, AniList)
   │
   ▼
Core (security, dependencies, limiter)
   │   JWT creation/verification, password hashing, auth dependency
   │
   ▼
Database (SQLAlchemy + Supabase/PostgreSQL)
       Models define table structure, sessions handle transactions
```

**Key concepts:**

`get_current_user` is a FastAPI dependency injected into every protected endpoint. It reads the JWT from the `Authorization` header, decodes it, and returns the current user from the database. If the token is missing or invalid, it raises a `401 Unauthorized` error automatically.

`get_db` is a FastAPI dependency that provides a SQLAlchemy database session per request and closes it automatically when the request is done, even if an error occurs.

---

## Database Schema

Four tables in Supabase (PostgreSQL).

### `users`
Stores the two application users. No open registration — users are created via `seed_users.py`.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| email | text, unique | |
| password_hash | text | bcrypt hash |
| username | text, unique | |
| created_at | timestamptz | |

### `anime`
Local cache of anime data fetched from Jikan or added manually. Shared between all users to avoid repeated external API calls.

| Column | Type | Notes |
|---|---|---|
| id | integer (PK) | MAL anime ID (positive) or custom ID (negative) |
| title | text | |
| image_url | text | |
| synopsis | text | |
| episodes | integer | |
| mean_score | float | |
| raw_data | jsonb | Full Jikan API response |
| cached_at | timestamptz | |

### `library_entries`
The shared library. One row per anime. Status is shared and visible to all users.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| anime_id | integer, unique (FK → anime.id) | One entry per anime |
| status | enum | watching / completed / plan_to_watch / dropped / on_hold |
| added_by | uuid (FK → users.id) | Who first added this anime |
| created_at | timestamptz | |
| updated_by | uuid (FK → users.id) | Who last updated the status |
| updated_at | timestamptz | Auto-updated on change |

### `user_anime_data`
Personal ratings and notes. Private per user — one row per (user, anime) combination.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users.id) | |
| anime_id | integer (FK → anime.id) | |
| rating | integer (1–10, nullable) | |
| notes | text (nullable) | |
| updated_at | timestamptz | |
| | unique (user_id, anime_id) | One entry per user per anime |

---

## Authentication

The backend uses a custom JWT-based auth system built with `passlib` and `python-jose`.

**Flow:**
1. Client sends `POST /auth/login` with email and password
2. Backend verifies the password against the stored bcrypt hash
3. On success, a signed JWT is returned containing the user's ID as the `sub` claim
4. Client attaches the JWT to all subsequent requests: `Authorization: Bearer <token>`
5. Protected endpoints use `get_current_user` which decodes the JWT and fetches the user
6. Tokens expire after 60 minutes (configurable via `JWT_EXPIRE_MINUTES`)

There is no open registration. The two users are created once via `seed_users.py` using credentials from `.env`.

---

## API Endpoints

All endpoints except `POST /auth/login` require:
```
Authorization: Bearer <your_token>
```

---

### Auth

#### `POST /auth/login`
Log in and receive a JWT access token. Rate limited to 5 requests per minute per IP.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

| Status | Reason |
|---|---|
| `401` | Incorrect email or password |
| `429` | Too many requests |

---

### Anime

#### `GET /anime/search`
Search for anime via the Jikan API. At least one of `q` or `genres` must be provided.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| q | string | Title search query |
| genres | string | Comma-separated Jikan genre IDs (e.g. `1,2`) |

**Example requests:**
```
GET /anime/search?q=naruto
GET /anime/search?genres=1
GET /anime/search?q=one piece&genres=1,2
```

**Response `200`:** Raw Jikan API response with a list of matching anime.

| Status | Reason |
|---|---|
| `400` | Neither `q` nor `genres` provided |
| `503` | Could not reach Jikan API |

**Common genre IDs:**

| ID | Genre | ID | Genre |
|---|---|---|---|
| 1 | Action | 10 | Fantasy |
| 2 | Adventure | 14 | Horror |
| 4 | Comedy | 22 | Romance |
| 7 | Mystery | 24 | Sci-Fi |
| 8 | Drama | 37 | Supernatural |

---

#### `GET /anime/{anime_id}/streaming`
Fetch streaming service links for an anime via the AniList GraphQL API. Matches by anime title and returns only streaming-type links.

**URL parameter:** `anime_id` — the MAL anime ID (integer)

**Response `200`:**
```json
[
  {
    "site": "Crunchyroll",
    "url": "http://www.crunchyroll.com/one-piece",
    "type": "STREAMING"
  },
  {
    "site": "Netflix",
    "url": "https://www.netflix.com/title/80107103",
    "type": "STREAMING"
  }
]
```

| Status | Reason |
|---|---|
| `404` | Anime not found in local database |
| `503` | Could not reach AniList API |

---

### Library

#### `GET /library/`
Fetch all anime in the shared library.

**Response `200`:** Array of `library_entries` rows.

---

#### `POST /library/add`
Add an anime to the shared library using its MAL ID. Backend automatically fetches full anime data from Jikan and caches it locally.

**Request body:**
```json
{
  "mal_id": 21
}
```

**Response `200`:** The created `library_entry` row.

| Status | Reason |
|---|---|
| `409` | Anime already exists in the library |
| `503` | Could not fetch anime data from Jikan |

---

#### `POST /library/add-custom`
Add a custom anime that doesn't exist in the Jikan API. Custom anime are assigned a negative integer ID to distinguish them from MAL anime.

**Request body:**
```json
{
  "title": "My Custom Anime",
  "image_url": "https://example.com/image.jpg",
  "synopsis": "A great story.",
  "episodes": 12,
  "mean_score": 8.5
}
```

Only `title` is required. All other fields are optional.

**Response `200`:** The created `library_entry` row.

---

#### `PATCH /library/{anime_id}/status`
Update the watch status of an anime in the shared library. Any authenticated user can change the status. Automatically updates `updated_by` and `updated_at`.

**URL parameter:** `anime_id` — the MAL anime ID (integer)

**Request body:**
```json
{
  "status": "watching"
}
```

Valid values: `watching` `completed` `plan_to_watch` `dropped` `on_hold`

**Response `200`:** The updated `library_entry` row.

| Status | Reason |
|---|---|
| `404` | Anime not found in library |

---

#### `PATCH /library/{anime_id}/userdata`
Set or update personal rating and/or notes for an anime. Upserts — creates a new row if none exists for this user and anime combination, otherwise updates the existing one.

**URL parameter:** `anime_id` — the MAL anime ID (integer)

**Request body** (all fields optional):
```json
{
  "rating": 8,
  "notes": "Amazing world building!"
}
```

**Response `200`:** The created or updated `user_anime_data` row.

---

#### `DELETE /library/{anime_id}`
Remove an anime from the shared library.

**URL parameter:** `anime_id` — the MAL anime ID (integer)

**Response `200`:**
```json
{
  "detail": "Anime removed from library"
}
```

| Status | Reason |
|---|---|
| `404` | Anime not found in library |

---

### Users

#### `PATCH /users/update-email`
Update the current user's email address.

**Request body:**
```json
{
  "new_email": "newemail@example.com"
}
```

**Response `200`:** Updated user object (password hash excluded).

| Status | Reason |
|---|---|
| `400` | Email already in use |

---

#### `PATCH /users/update-password`
Update the current user's password. Requires the current password for verification.

**Request body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "Newpassword1"
}
```

**Response `200`:** Updated user object (password hash excluded).

| Status | Reason |
|---|---|
| `400` | Current password incorrect, or new password fails validation |

---

## External APIs

### Jikan API
- Base URL: `https://api.jikan.moe/v4`
- No API key required
- Used for: anime search by title and/or genre, fetching full anime details when adding to library
- Rate limit: 3 requests/second, 60 requests/minute

### AniList API
- Base URL: `https://graphql.anilist.co`
- No API key required
- GraphQL-based — all requests are POST with a query string and variables in the body
- Used for: fetching streaming service links per anime by title

---

## Rate Limiting

Login is rate limited to **5 requests per minute per IP** using `slowapi`. This protects against brute force attacks.

Exceeding the limit returns:
```json
{
  "error": "Rate limit exceeded: 5 per 1 minute"
}
```
with status `429 Too Many Requests`.

---

## Password Validation

When changing a password via `PATCH /users/update-password`, the new password must meet the following requirements:

- At least 8 characters
- At least one uppercase letter
- At least one number

Failing validation returns a `400 Bad Request` with a descriptive error message.

---

## CORS

The backend allows cross-origin requests from `http://localhost:3000` (local Next.js frontend) with credentials and all HTTP methods enabled. Additional origins (e.g. production frontend URL) should be added to `allow_origins` in `main.py` before deploying.
