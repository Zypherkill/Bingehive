# Bingehive 🎌

A shared anime library web app for two users. Search for anime, add them to a shared library, track watch status, and leave personal ratings and notes.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Anime Search](#anime-search)
  - [Library](#library)
  - [Users](#users)
- [Authentication Flow](#authentication-flow)

---

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM for database interaction
- [Supabase](https://supabase.com/) — Hosted PostgreSQL database
- [Jikan API](https://jikan.moe/) — Unofficial MyAnimeList API for anime data
- [passlib + bcrypt](https://passlib.readthedocs.io/) — Password hashing
- [python-jose](https://python-jose.readthedocs.io/) — JWT token generation and verification
- [httpx](https://www.python-httpx.org/) — Async HTTP client for external API calls

## Project Structure

```
backend/
|
├── core/
│   ├── config.py          # Environment variable loading
│   ├── dependencies.py    # get_current_user FastAPI dependency
│   └── security.py        # Password hashing and JWT logic
├── routers/
│   ├── auth.py            # Login endpoint
│   ├── anime.py           # Anime search endpoint
│   ├── library.py         # Shared library endpoints
│   └── users.py           # User management endpoints
├── services/
│   └── anime_client.py    # Jikan API integration
|
├── database.py            # SQLAlchemy engine and session setup
├── models.py              # SQLAlchemy table models
├── user_schema.py         # Pydantic response schemas
└── main.py                # FastAPI app entry point
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- A [Supabase](https://supabase.com/) project with the database schema applied

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bingehive.git
cd bingehive/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary python-dotenv passlib[bcrypt]==4.0.1 python-jose[cryptography] httpx

# Create .env file (see Environment Variables below)

# Seed the two users (run once)
python seed_users.py

# Start the development server
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.  
Interactive API docs (Swagger UI) are available at `http://127.0.0.1:8000/docs`.

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-x-eu-north-1.pooler.supabase.com:5432/postgres

JWT_SECRET=your-generated-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

USER1_EMAIL=user1@example.com
USER1_PASSWORD=user1password
USER1_USERNAME=User1

USER2_EMAIL=user2@example.com
USER2_PASSWORD=user2password
USER2_USERNAME=User2
```

Generate a secure `JWT_SECRET` with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

> **Note:** The `USER*` variables are only used by `seed_users.py` and are not required after the initial setup.

---

## Database Schema

The database has four tables in Supabase (PostgreSQL):

### `users`
Stores the two application users.

| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| email | text, unique | |
| password_hash | text | bcrypt hash |
| username | text, unique | |
| created_at | timestamptz | |

### `anime`
Local cache of anime data fetched from Jikan API. Shared between all users.

| Column | Type | Description |
|---|---|---|
| id | integer (PK) | MyAnimeList anime ID |
| title | text | |
| image_url | text | |
| synopsis | text | |
| episodes | integer | |
| mean_score | float | |
| raw_data | jsonb | Full Jikan response |
| cached_at | timestamptz | |

### `library_entries`
The shared library. One row per anime — status is visible to all users.

| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | |
| anime_id | integer, unique (FK → anime.id) | |
| status | enum | watching / completed / plan_to_watch / dropped / on_hold |
| added_by | uuid (FK → users.id) | Who first added this anime |
| created_at | timestamptz | |
| updated_by | uuid (FK → users.id) | Who last changed the status |
| updated_at | timestamptz | |

### `user_anime_data`
Personal ratings and notes per user per anime.

| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users.id) | |
| anime_id | integer (FK → anime.id) | |
| rating | integer (1–10, nullable) | |
| notes | text (nullable) | |
| updated_at | timestamptz | |
| | unique (user_id, anime_id) | One entry per user per anime |

---

## API Reference

All endpoints except `POST /auth/login` require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

---

### Auth

#### `POST /auth/login`
Log in and receive a JWT access token.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

**Errors:**
- `401 Unauthorized` — incorrect email or password

---

### Anime Search

#### `GET /anime/search`
Search for anime via the Jikan API. Supports search by title, genre, or both.

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| q | string | No* | Search query (title) |
| genres | string | No* | Comma-separated genre IDs (e.g. `1,2`) |

*At least one of `q` or `genres` must be provided.

**Example requests:**
```
GET /anime/search?q=naruto
GET /anime/search?genres=1
GET /anime/search?q=naruto&genres=1
```

**Response:** Raw Jikan API response containing a list of anime.

**Errors:**
- `400 Bad Request` — neither `q` nor `genres` provided
- `503 Service Unavailable` — could not reach Jikan API

**Common genre IDs:**

| ID | Genre |
|---|---|
| 1 | Action |
| 2 | Adventure |
| 4 | Comedy |
| 7 | Mystery |
| 8 | Drama |
| 10 | Fantasy |
| 22 | Romance |
| 24 | Sci-Fi |

---

### Library

#### `GET /library/`
Fetch all anime in the shared library.

**Response:** Array of `library_entries` rows.

---

#### `POST /library/add`
Add an anime to the shared library. Automatically fetches anime data from Jikan using the provided MAL ID.

**Request body:**
```json
{
  "mal_id": 21
}
```

**Response:** The created `library_entry` row.

**Errors:**
- `409 Conflict` — anime already exists in the library
- `503 Service Unavailable` — could not fetch anime data from Jikan

---

#### `PATCH /library/{anime_id}/status`
Update the watch status of an anime. Any user can change the status.

**URL parameter:** `anime_id` — the MAL anime ID

**Request body:**
```json
{
  "status": "watching"
}
```

Valid status values: `watching`, `completed`, `plan_to_watch`, `dropped`, `on_hold`

**Response:** The updated `library_entry` row.

**Errors:**
- `404 Not Found` — anime not in library

---

#### `PATCH /library/{anime_id}/userdata`
Set or update personal rating and/or notes for an anime. Creates a new entry if one doesn't exist (upsert).

**URL parameter:** `anime_id` — the MAL anime ID

**Request body** (all fields optional):
```json
{
  "rating": 8,
  "notes": "Great storyline!"
}
```

**Response:** The created or updated `user_anime_data` row.

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

**Response:** Updated user object (without password hash).

**Errors:**
- `400 Bad Request` — email already in use

---

#### `PATCH /users/update-password`
Update the current user's password. Requires the current password for verification.

**Request body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

**Response:** Updated user object (without password hash).

**Errors:**
- `400 Bad Request` — current password is incorrect

---

## Authentication Flow

1. Client sends `POST /auth/login` with email and password
2. Backend verifies password against bcrypt hash in database
3. Backend returns a signed JWT containing the user's ID (`sub` claim)
4. Client stores the JWT and includes it in all subsequent requests as `Authorization: Bearer <token>`
5. Protected endpoints use the `get_current_user` dependency which decodes the JWT and fetches the user from the database
6. Token expires after 60 minutes (configurable via `JWT_EXPIRE_MINUTES`)
