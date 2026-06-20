# Worldie ⚽ — World Cup 2026 Predictions

Predict World Cup 2026 match scores, earn points for accuracy, and compete with friends on a live leaderboard.

**Live demo:** [worldie-predictions.vercel.app](https://worldie-predictions.vercel.app)

---

## About

Worldie is a full-stack prediction game built around the 2026 FIFA World Cup. Users predict the scoreline of each match before kickoff, earn points based on accuracy, and compete against others on a real-time leaderboard. Match data is pulled automatically from the football-data.org API and synced every 15 minutes via a background cron job.

---

## Features

- **Authentication** — Email/password signup and Google OAuth, unified into a single user model
- **Live match data** — World Cup 2026 fixtures and results auto-synced every 15 minutes from football-data.org
- **Score predictions** — Submit predicted scorelines before kickoff; predictions lock automatically once a match starts
- **Points system** — 3 points for an exact scoreline, 1 point for correctly predicting the outcome (win/draw/loss)
- **Leaderboard** — Ranked standings built with a MongoDB aggregation pipeline
- **Match organisation** — Fixtures grouped by Group Stage (A–L) and named knockout rounds (Round of 32 through Final)
- **Editable username** — Users can update their display name at any time from the navbar
- **Dark UI** — Team flags, colour-coded match cards with per-team accent bars, and a steel-blue accent theme

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS v4
- React Router v6

**Backend**
- Node.js + Express
- MongoDB with Mongoose ODM
- JWT authentication
- Passport.js (local strategy + Google OAuth 2.0)
- node-cron for scheduled data sync

**Deployment**
- Frontend — Vercel
- Backend — Render
- Database — MongoDB Atlas

---

## Architecture Highlights

**Dual auth unified through a shared user model** — Both credential login and Google OAuth resolve to the same `User` document. The Google strategy uses a find-or-create pattern (by `googleId`, then by email, then new user) so returning users are never duplicated regardless of which login method they use.

**Idempotent match sync** — The cron job calls `findOneAndUpdate` with `upsert: true` keyed on an `externalId` field, so syncing the same fixture multiple times is safe and doesn't create duplicates. The same function is exposed as a POST `/sync` endpoint for manual triggers.

**MongoDB aggregation pipeline for leaderboard** — A single pipeline groups predictions by user, sums points, sorts descending, then does a `$lookup` to join user display names — avoiding N+1 queries and keeping ranking logic inside the database.

**Compound unique index on predictions** — A `{ user, match }` compound index at the schema level ensures one prediction per user per match at the database layer, not just the application layer.

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

Create a `.env` file in `server/`:

```
MONGODB_URI=
JWT_SECRET=
FOOTBALL_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLIENT_URL=
```

### Running Locally

Start the backend (from `server/`):

```bash
npm run dev
```

Start the frontend (from `client/`):

```bash
npm run dev
```

The client runs on `http://localhost:5173` and the API on `http://localhost:8080`.

---

## Roadmap

- Animated 3D player characters using Three.js + react-three-fiber for the leaderboard podium
- Private prediction leagues — create a group and compete with specific friends
- Push notifications for upcoming matches and prediction deadlines
- Per-user prediction history and accuracy stats (correct outcomes %, exact scores %)

---

## Author

Built by Mary Araujo.
