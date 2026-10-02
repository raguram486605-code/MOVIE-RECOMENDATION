# Reelrank – MERN Movie Recommendation App

## Structure
```
server/  Express API (server.js), Mongoose models (models.js), recommendation logic (recommend.js), seed.js
client/  React + Vite UI (src/App.jsx, src/styles.css)
```

## Setup
Requires Node 18+ and MongoDB running locally (or an Atlas URI).

```bash
# 1. API
cd server && npm install
cp .env.example .env          # set MONGO_URI and JWT_SECRET
npm run seed                  # sample movies, reviews, and users
npm run dev                   # http://localhost:5000

# 2. UI (new terminal)
cd client && npm install && npm run dev   # http://localhost:5173
```
Admin login after seeding: `admin@example.com` / `password123`.
To make an existing user admin: `db.users.updateOne({email:"you@x.com"},{$set:{role:"admin"}})`.

## How recommendations work
- Sentiment is set when a review is saved: 4–5 stars = positive, 3 = neutral, 1–2 = negative.
- Positive % = positive reviews / total reviews.
- Ranking score = (positive + 2.5) / (total + 5). This is positive % smoothed with a neutral prior, so
  1 review at 100% ranks below 100 reviews at 95%. Ties break on positive count.
- `GET /api/recommendations` returns the top movies; `GET /api/recommendations/me` (logged in) restricts to
  genres the user rated 4+ and excludes movies they already reviewed.
- Tune `PRIOR_WEIGHT` in `server/recommend.js`.

## REST API
| Method | Path | Auth |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | – |
| GET | /api/movies?q=&genre=&year=&sort=&page= | – |
| GET | /api/movies/:id (includes stats + reviews) | – |
| POST | /api/movies/:id/reviews | user |
| DELETE | /api/reviews/:id | owner/admin |
| GET | /api/recommendations, /api/recommendations/me | –/user |
| POST/PUT/DELETE | /api/admin/movies[/:id] | admin |
| GET | /api/admin/reviews | admin |
