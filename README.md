# Music4You

Music4You is a full-stack music playlist management application. It provides a React frontend for browsing songs and managing playlists, plus an Express/PostgreSQL backend API for authentication, song data, playlist CRUD operations, and realtime public playlist notifications.

## Demo Video

Watch the project demo on YouTube: [https://youtu.be/-1fcqRUAOCs](https://youtu.be/-1fcqRUAOCs)

## Features

- User registration, login, logout, and current-user profile lookup
- JWT-based authentication with protected API routes
- Song listing, searching, pagination, and song detail lookup
- User playlist management: create, update, delete, and list playlists
- Add songs to playlists and remove songs from playlists
- Public playlist browsing
- Server-Sent Events (SSE) stream for newly created or newly public playlists
- Built-in backend API documentation page at `/api-docs`

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- shadcn/Radix-style UI dependencies
- React Hook Form and Zod

### Backend

- Node.js with ES modules
- Express 5
- PostgreSQL
- Knex.js migrations and seeds
- JSON Web Tokens (`jsonwebtoken`)
- Password hashing with `bcryptjs`
- Request validation with Zod
- Handlebars API documentation views

### Infrastructure / Tooling

- Docker and Docker Compose for backend API + PostgreSQL
- npm scripts for development, build, migration, rollback, and seeding

## Repository Structure

```text
.
├── README.md
├── backend/
│   ├── app.js                  # Express app configuration and route mounting
│   ├── server.js               # Server startup and database connection check
│   ├── docker-compose.yml      # PostgreSQL + API services
│   ├── Dockerfile
│   ├── knexfile.js             # Knex database configuration
│   ├── controllers/            # Request handlers
│   ├── db/
│   │   ├── migrations/         # Database schema migrations
│   │   ├── seeds/              # Seed data
│   │   └── db.js               # Knex instance
│   ├── middlewares/            # Auth, validation, response, and error middleware
│   ├── models/                 # Database access models
│   ├── routers/                # API route definitions
│   ├── services/               # Business logic
│   ├── validators/             # Zod schemas
│   └── views/                  # Handlebars API documentation
└── frontend/
    ├── src/
    │   ├── auth/               # API client and token helpers
    │   ├── components/         # Shared UI components
    │   ├── contexts/           # Auth context
    │   ├── layouts/            # Page layouts
    │   ├── pages/              # Application pages
    │   ├── routes/             # React Router setup and route guards
    │   ├── services/           # Frontend API services
    │   └── config.js           # Vite environment config
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- Node.js and npm
- PostgreSQL, or Docker if you want to run the backend stack with Compose
- Git

## Environment Variables

### Backend

Create a `.env` file inside `backend/` for local development:

```env
PORT=3443
BASE_URL=http://localhost:3443

DB_HOST=localhost
DB_PORT=15432
DB_USER=admin
DB_PASSWORD=123456
DB_NAME=mydb

JWT_SECRET=change-this-secret
JWT_ACCESS_EXPIRES=15m
SALT_ROUNDS=12
NODE_ENV=development
```

The backend reads database settings from `backend/knexfile.js` and authentication settings from `backend/services/auth-s.js`.

For Docker Compose, `backend/docker-compose.yml` expects an `backend/.env.docker` file for the API service. A typical Docker configuration is:

```env
PORT=3443
BASE_URL=http://localhost:3443

DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=123456
DB_NAME=mydb

JWT_SECRET=change-this-secret
JWT_ACCESS_EXPIRES=15m
SALT_ROUNDS=12
NODE_ENV=development
```

### Frontend

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:3443/api/v1
VITE_API_KEY=
```

`VITE_API_URL` is used by the frontend API client in `frontend/src/config.js`.

## Local Development Setup

### 1. Start PostgreSQL

You can use your own PostgreSQL instance, or start the database service from the backend Compose file:

```bash
cd backend
docker compose up -d db
```

The included Compose database uses:

- Host port: `15432`
- Database: `mydb`
- User: `admin`
- Password: `123456`

### 2. Install and run the backend

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

The backend starts on `PORT` from `.env`, defaulting to `3443`.

Useful backend URLs:

- API base URL: `http://localhost:3443/api/v1`
- API docs: `http://localhost:3443/api-docs`

### 3. Install and run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open the Vite dev server URL shown in the terminal.

## Docker Setup

To run the backend API and PostgreSQL together:

```bash
cd backend
docker compose up --build
```

After the containers are running, execute migrations and seeds inside the API container if they are not already handled by your container entrypoint:

```bash
docker compose exec api npm run migrate
docker compose exec api npm run seed
```

The API is exposed on `http://localhost:3443` by default.

## Available Scripts

### Backend (`backend/package.json`)

```bash
npm start          # Run server.js
npm run dev        # Run backend with nodemon
npm run migrate    # Run latest Knex migrations
npm run rollback   # Roll back the latest Knex migration batch
npm run seed       # Run Knex seed files
```

### Frontend (`frontend/package.json`)

```bash
npm run dev        # Start Vite dev server
npm run build      # Build production frontend
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## API Overview

All API routes are mounted under:

```text
/api/v1
```

The backend uses a consistent response format:

```json
{
  "data": {},
  "meta": {
    "timestamp": "2026-04-01T09:34:06.175Z"
  },
  "error": null
}
```

For protected endpoints, send the access token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
```

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Log in and receive an access token |
| `POST` | `/auth/logout` | Protected | Log out current user |
| `GET` | `/auth/me` | Protected | Get the current authenticated user |

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/users/profile` | Protected | Get the authenticated user's profile |

### Songs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/songs` | Public | List songs with query validation |
| `GET` | `/songs/:id` | Public | Get a song by ID |

The frontend song service calls `/songs` with query parameters such as `q`, `page`, and `limit`.

### Playlists

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/playlists/public/new` | Public SSE | Stream new public playlist events |
| `GET` | `/playlists/public` | Public | List public playlists |
| `GET` | `/playlists/:id` | Public if playlist is public; owner if private | Get playlist details |
| `GET` | `/playlists/:id/songs` | Public if playlist is public; owner if private | Get songs in a playlist |
| `GET` | `/playlists` | Protected | List current user's playlists |
| `POST` | `/playlists` | Protected | Create a playlist |
| `PUT` | `/playlists/:id` | Protected owner | Update a playlist |
| `DELETE` | `/playlists/:id` | Protected owner | Delete a playlist |
| `POST` | `/playlists/:id/songs` | Protected owner | Add a song to a playlist |
| `DELETE` | `/playlists/:id/songs/:songId` | Protected owner | Remove a song from a playlist |

## Database Schema Overview

The initial migration creates these tables:

- `users`
  - `id`, `full_name`, `email`, `password`, `created_at`
- `songs`
  - `id`, `title`, `artist`, `duration_seconds`, `genre`, `audio_url`, `created_at`
- `playlists`
  - `id`, `user_id`, `name`, `description`, `is_public`, `created_at`
- `playlist_songs`
  - `playlist_id`, `song_id`, `sort_order`, `added_at`
  - composite primary key on `playlist_id` and `song_id`

The seed file `backend/db/seeds/01_songs.js` loads initial song data from `backend/db/songs.js`.

## Frontend Routes

The frontend router defines these main routes:

| Route | Access | Page |
| --- | --- | --- |
| `/` | Public | Home page |
| `/login` | Guest only | Login page |
| `/register` | Guest only | Registration page |
| `/profile` | Protected | User profile page |
| `/songs` | Protected | Songs page |
| `*` | Public | Not found page |

## Notes

- Root requests to the backend redirect to `/api-docs`.
- Backend route validation is implemented with Zod schemas in `backend/validators/`.
- Auth and playlist ownership checks are implemented in `backend/middlewares/auth-mw.js`.
- The frontend stores and attaches access tokens through helpers in `frontend/src/auth/`.
- The current root README is the primary project documentation; `frontend/README.md` still contains the default Vite template text.
