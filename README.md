# Chronos Zenith

A production-ready, cross-platform **timeline-based goal tracking system** with a streak-weighted scoring engine.

---

## Project Structure

```
chronos-zenith/
├── backend/          # Node.js + Express + MongoDB API
├── web-dev/          # Next.js 14 + Tailwind CSS web app
└── mobile-dev/       # Expo React Native + TypeScript mobile app
```

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Node.js, Express, MongoDB (Mongoose)    |
| Web      | Next.js 14, React, Tailwind CSS, Zustand, React Query |
| Mobile   | Expo SDK 50, React Native, TypeScript, AsyncStorage |

---

## Scoring System

- Each task = **1 point** (live engine)
- `totalScore = totalTasks × 1`
- `achievedScore = completedTasks × 1`
- **Streak Bonus**: Complete 100% of tasks for 2 consecutive days → +1 bonus on Day 2

---

## Auth (single-user passcode)

This is a **single-user** app. There is no email/password login.

- Set `APP_PASSCODE` in the backend `.env`
- Web and mobile ask for that passcode once, store it locally, and send it as the `x-passcode` header on every API request
- A wrong/missing passcode returns **401** and the unlock screen shows again
- Web + mobile stay in sync through the same MongoDB backend

---

## Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

---

## Setup & Run

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and APP_PASSCODE

npm install
npm run dev
# API runs on http://localhost:5002
```

**Seed demo data:**
```bash
node src/scripts/seed.js
# Unlock the app with APP_PASSCODE from your .env
```

---

### 2. Web App

```bash
cd web-dev
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5002

npm install
npm run dev
# Opens at http://localhost:3000
```

---

### 3. Mobile App

```bash
cd mobile-dev
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://<your-local-ip>:5002
# Use your machine's LAN IP (not localhost) for physical devices

npm install
npx expo start
# Scan QR code with Expo Go app
```

---

## API Reference

### Owner
| Method | Endpoint | Description                |
|--------|----------|----------------------------|
| GET    | /me      | Get owner streak / rating  |

### Tasks
| Method | Endpoint        | Description              |
|--------|----------------|--------------------------|
| GET    | /tasks/:date   | Get tasks for a date     |
| POST   | /tasks         | Create a task            |
| PATCH  | /tasks/:id     | Toggle task completion   |
| DELETE | /tasks/:id     | Delete a task            |

### Stats
| Method | Endpoint        | Description              |
|--------|----------------|--------------------------|
| GET    | /stats/:date   | Get stats for a date     |
| GET    | /stats/history | Get last 30 days history |

All `/me`, task, and stats endpoints require the `x-passcode` header.

---

## Environment Variables

### Backend `.env`
```
PORT=5002
MONGODB_URI=mongodb://localhost:27017/chronos_zenith
APP_PASSCODE=change-me
NODE_ENV=development
```

### Web `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5002
```

### Mobile `.env`
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:5002
```

---

## Features

- ✅ Vertical timeline UI with animated task completion
- ✅ Streak-weighted scoring engine with bonus logic
- ✅ Single-user passcode unlock (web + mobile)
- ✅ Optimistic UI updates on task toggle
- ✅ Passcode persistence on mobile (AsyncStorage)
- ✅ Analytics screen with 14-day history
- ✅ Responsive, mobile-first design
- ✅ TypeScript throughout (web + mobile)
- ✅ Android home-screen widgets (timeline + score)
