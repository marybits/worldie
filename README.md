# Worldie ⚽ — World Cup 2026 Predictions

Predict World Cup 2026 match scores, earn points for accuracy, and compete with friends on a live leaderboard.

**Live demo:** [worldie-predictions.vercel.app](https://worldie-predictions.vercel.app)  
**API docs:** [worldie-api.onrender.com/api/docs](https://worldie-api.onrender.com/api/docs)

---

## About

Worldie is a full-stack prediction game built around the 2026 FIFA World Cup. Users predict the scoreline of each match before kickoff, earn points based on accuracy, and compete against others on a global or private leaderboard. Match data is pulled automatically from the football-data.org API and synced on a schedule via a background cron job.

Built as a learning project during my 2nd year of programming — every feature was designed, implemented, and iterated on from scratch.

---

## Features

- **Authentication** — Email/password signup and Google OAuth, unified into a single user model with JWT sessions
- **Live match data** — World Cup 2026 fixtures and results auto-synced from football-data.org; matches grouped by Group Stage (A–L) and knockout rounds (Round of 32 through Final)
- **Score predictions** — Submit and edit predicted scorelines before kickoff; predictions lock automatically once a match starts
- **Points system** — 3 pts for an exact scoreline · 1 pt for correctly predicting the outcome (win/draw/loss)
- **Global leaderboard** — Ranked standings built with a MongoDB aggregation pipeline; your live rank is shown in the navbar
- **Private groups** — Create a group with a unique 6-character invite code, share it with friends, and filter the leaderboard to your group only
- **Profile page** — Personal stats (points, predictions, exact scores, accuracy %), username change, and account deletion with two-step confirmation
- **API documentation** — Interactive Swagger UI at `/api/docs` documenting all endpoints with request/response schemas
- **Security** — Rate limiting on auth endpoints, admin-only routes protected by secret header, input validation on all user-submitted data
- **Design system** — Glassmorphism UI with CSS custom properties, Sora display font, animated skeleton loaders, LIVE match badges, and countdown timers to kickoff

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v4 (config-less, design tokens in `index.css`)
- React Router v6

**Backend**
- Node.js + Express
- MongoDB with Mongoose ODM
- JWT authentication
- Passport.js (Google OAuth 2.0)
- node-cron for scheduled match sync
- express-rate-limit for brute-force protection
- swagger-jsdoc + swagger-ui-express for API docs

**Deployment**
- Frontend — Vercel
- Backend — Render
- Database — MongoDB Atlas

---

## Architecture Highlights

**Dual auth unified through a shared user model** — Both credential login and Google OAuth resolve to the same `User` document. The Google strategy uses a find-or-create pattern (by `googleId`, then by email, then new user) so returning users are never duplicated regardless of which login method they use.

**Idempotent match sync** — The cron job calls `findOneAndUpdate` with `upsert: true` keyed on `externalId`, so syncing the same fixture multiple times never creates duplicates. The same function is protected behind an admin-only POST `/sync` endpoint for manual triggers.

**MongoDB aggregation pipeline for leaderboard** — A single pipeline groups predictions by user, sums points, sorts descending, then does a `$lookup` to join usernames — avoiding N+1 queries and keeping ranking logic inside the database. Supports optional `?groupId` filtering via a `$match` stage prepended to the pipeline.

**Compound unique index on predictions** — A `{ user, match }` compound index at the schema level enforces one prediction per user per match at the database layer, not just application logic.

**Portal-based dropdown** — The navbar dropdown uses `ReactDOM.createPortal` to render directly in `document.body`, escaping the `backdrop-filter` stacking context of the glassmorphism nav so it's never clipped.

**CSS-only design system** — Tailwind v4 has no config file, so all design tokens (colours, glass variables, shadows, fonts, animations) live in `client/src/index.css` as CSS custom properties. Components reference `var(--accent)`, `var(--glass-bg)` etc., making global theme changes a one-line edit.

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- A [football-data.org](https://www.football-data.org) API key (free tier works)
- Google OAuth credentials (from Google Cloud Console)

### Installation

```bash
git clone https://github.com/marybits/worldie.git
cd worldie
```

Install dependencies for both client and server:

```bash
cd client && npm install
cd ../server && npm install
```

### Environment Variables

Copy the example files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`**

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Random string, min 32 chars (`openssl rand -hex 32`) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | e.g. `http://localhost:8080/api/auth/google/callback` |
| `CLIENT_URL` | Frontend origin, e.g. `http://localhost:5173` |
| `FOOTBALL_API_KEY` | From football-data.org |
| `ADMIN_SECRET` | Secret for admin endpoints (`openssl rand -hex 24`) |
| `PORT` | Defaults to `8080` |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL, e.g. `http://localhost:8080/api` |

### Running Locally

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

App runs at `http://localhost:5173` · API at `http://localhost:8080`.

### API Documentation

Once the server is running, Swagger UI is available at:

```
http://localhost:8080/api/docs
```

All endpoints are documented with request bodies, parameters, and response codes. Protected endpoints can be tested by clicking **Authorize** and entering a Bearer JWT token. Admin endpoints require an `x-admin-secret` header.

---

## Points System

| Result | Points |
|---|---|
| Exact scoreline (e.g. predicted 2-1, actual 2-1) | **3 pts** |
| Correct outcome (win/draw/loss, wrong score) | **1 pt** |
| Wrong outcome | **0 pts** |

---

## Roadmap

- Push notifications for upcoming matches and prediction deadlines
- Animated podium for the leaderboard top 3
- Per-match prediction breakdown (see what everyone predicted after the match)
- Tournament bracket view for the knockout stage

---

## Author

Built by Mary Araujo — [github.com/marybits](https://github.com/marybits)
