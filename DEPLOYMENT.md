# Chronos Zenith — Full Deployment Guide

> Single-user, fully free cloud deployment.  
> Web + Mobile (Android APK) both talk to the same MongoDB Atlas database via a shared backend API.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLOUD                                │
│                                                             │
│   ┌──────────────┐        ┌──────────────────────────────┐ │
│   │   Vercel     │        │          Render              │ │
│   │  (Next.js)   │──────▶ │   Node.js / Express API      │ │
│   │  Web App     │        │   PORT 5002                  │ │
│   └──────────────┘        └──────────────┬───────────────┘ │
│                                          │                  │
│   ┌──────────────┐                       │                  │
│   │  Android APK │──────────────────────▶│                  │
│   │  (on phone)  │                       │                  │
│   └──────────────┘                       ▼                  │
│                            ┌─────────────────────────────┐ │
│                            │      MongoDB Atlas (M0)      │ │
│                            │   Free shared cluster        │ │
│                            │   cluster0.k202xxm.mongodb   │ │
│                            └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key point**: Web and mobile share the exact same backend API and the same MongoDB database. Data is always in sync.

---

## Free Tier Services Used

| Service | What it hosts | Free limit |
|---|---|---|
| [MongoDB Atlas](https://cloud.mongodb.com) | Database | 512 MB, M0 shared cluster |
| [Render](https://render.com) | Node.js API | 1 web service, sleeps after 15 min idle |
| [Vercel](https://vercel.com) | Next.js web app | Unlimited hobby projects |
| [Expo EAS](https://expo.dev) | Android APK build | Free for personal use |

---

## Prerequisites

Before starting, make sure you have:

- [ ] Node.js ≥ 18 installed
- [ ] Git installed and code pushed to a GitHub repository
- [ ] An [Expo account](https://expo.dev) (free)
- [ ] A [Render account](https://render.com) (free)
- [ ] A [Vercel account](https://vercel.com) (free)
- [ ] MongoDB Atlas already set up (your connection string is in `.env.example`)

---

## Step 1 — MongoDB Atlas (Verify Setup)

Your Atlas cluster is already configured. Just verify these two things:

### 1a. Allow connections from anywhere (required for Render)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **Network Access** in the left sidebar
3. Click **Add IP Address**
4. Choose **Allow Access from Anywhere** → `0.0.0.0/0`
5. Click **Confirm**

### 1b. Confirm your database user exists

1. Click **Database Access** in the left sidebar
2. Confirm user `belalaamirkhan_db_user` exists with **Read and Write** access
3. If not, create it with those permissions

Your connection string (already in `.env.example`):
```
mongodb+srv://belalaamirkhan_db_user:<password>@cluster0.k202xxm.mongodb.net/?appName=Cluster0
```

---

## Step 2 — Deploy Backend to Render

### 2a. Push code to GitHub

Make sure your entire `chronos-zenith/` folder is committed and pushed to GitHub.

### 2b. Create Render Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---|---|
| **Root Directory** | `chronos-zenith/backend` |
| **Environment** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 2c. Add Environment Variables

In the Render dashboard under **Environment**, add these variables:

```
PORT=5002
MONGODB_URI=mongodb+srv://belalaamirkhan_db_user:ZtUCzXPX6gbhMG2s@cluster0.k202xxm.mongodb.net/?appName=Cluster0
JWT_SECRET=<generate a random 64-character string>
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

> **Generate a JWT secret**: Run this in your terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 2d. Deploy

Click **Create Web Service**. Render will build and deploy. After ~2 minutes you'll get a URL like:
```
https://chronos-zenith-api.onrender.com
```

**Test it**: Open `https://chronos-zenith-api.onrender.com/health` in your browser. You should see:
```json
{ "status": "ok", "app": "Chronos Zenith" }
```

> **Note on free tier sleep**: Render's free tier sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. For a single user this is acceptable — the app will show a loading spinner while the backend wakes.

---

## Step 3 — Deploy Web App to Vercel

### 3a. Import project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `chronos-zenith/web-dev` |
| **Framework Preset** | Next.js (auto-detected) |

### 3b. Add Environment Variable

Under **Environment Variables**, add:

```
NEXT_PUBLIC_API_URL=https://chronos-zenith-api.onrender.com
```

Replace `chronos-zenith-api` with your actual Render subdomain.

### 3c. Deploy

Click **Deploy**. After ~1 minute you'll get a URL like:
```
https://chronos-zenith.vercel.app
```

**Test it**: Open the URL, register an account, add a task. Confirm it saves.

---

## Step 4 — Build Android APK

The APK is a standalone Android app that installs directly on your phone — no Play Store needed.

### 4a. Update the API URL in mobile config

Open `chronos-zenith/mobile-dev/.env` and replace the placeholder with your real Render URL:

```bash
# chronos-zenith/mobile-dev/.env
EXPO_PUBLIC_API_URL=https://chronos-zenith-api.onrender.com
```

Also update `chronos-zenith/mobile-dev/eas.json` — replace all three `YOUR_RENDER_APP_NAME` placeholders with your actual Render subdomain.

### 4b. Install EAS CLI

```bash
npm install -g eas-cli
```

### 4c. Login to Expo

```bash
cd chronos-zenith/mobile-dev
eas login
```

### 4d. Initialize EAS for this project

```bash
eas init
```

This will:
- Link the project to your Expo account
- Auto-fill the `projectId` in `app.json`

### 4e. Build the APK

```bash
eas build --platform android --profile preview
```

This builds in Expo's cloud (~10–15 minutes). When done, EAS gives you a **download link** for the `.apk` file.

### 4f. Install on your Android phone

1. Download the `.apk` from the EAS link
2. Transfer to your phone (AirDrop, email, Google Drive, USB)
3. On your phone: **Settings → Security → Install unknown apps** → allow your browser/file manager
4. Tap the `.apk` file to install
5. Open **Chronos Zenith** and log in with the same account you used on web

---

## Step 5 — Android Home Screen Widgets

The app includes two native Android home screen widgets:

- **Timeline Widget** — shows today's tasks with completion status
- **Score Widget** — shows today's score, streak, and progress bar

### How widgets work

The widgets are native Android `AppWidgetProvider` classes built into the APK. They receive data from the app via a React Native native module bridge (`WidgetModule.java`). The data flow is:

```
App opens / task toggled
  → useWidgetSync hook (JS)
  → WidgetModule.updateWidgets() (native bridge)
  → WidgetDataStore.saveWidgetData() (SharedPreferences)
  → TimelineWidgetProvider.refreshAll() + ScoreWidgetProvider.refreshAll()
  → Android redraws home screen widgets
```

### Adding widgets to your home screen

After installing the APK:

1. Long-press on your Android home screen
2. Tap **Widgets**
3. Find **Chronos Zenith** in the list
4. You'll see two widgets: **Chronos Timeline** and **Chronos Score**
5. Drag either one to your home screen

### Widget data sync

- Widgets update automatically whenever you open the app
- Widgets update whenever you add, complete, or delete a task
- Widgets refresh when the app comes back to the foreground
- Widgets show the last synced data when the app is closed (no background network calls)

> **Important**: Widgets do NOT make their own network requests. They display data that was last synced when the app was open. To get fresh data, open the app — it will sync to MongoDB and push updated data to the widgets automatically.

---

## Updating the App

### Backend changes
Push to GitHub → Render auto-deploys on every push to main branch.

### Web changes
Push to GitHub → Vercel auto-deploys on every push to main branch.

### Mobile changes
After any code change to the mobile app:
```bash
cd chronos-zenith/mobile-dev
eas build --platform android --profile preview
```
Download the new APK and reinstall on your phone.

---

## Environment Variables Reference

### Backend (`chronos-zenith/backend/.env`)
```
PORT=5002
MONGODB_URI=mongodb+srv://belalaamirkhan_db_user:<password>@cluster0.k202xxm.mongodb.net/?appName=Cluster0
JWT_SECRET=<64-char random hex string>
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Web (`chronos-zenith/web-dev/.env.local`)
```
NEXT_PUBLIC_API_URL=https://<your-render-subdomain>.onrender.com
```

### Mobile (`chronos-zenith/mobile-dev/.env`)
```
EXPO_PUBLIC_API_URL=https://<your-render-subdomain>.onrender.com
```

---

## Troubleshooting

### "Network request failed" on mobile
- Confirm `EXPO_PUBLIC_API_URL` in `.env` points to your Render URL (not localhost)
- Rebuild the APK after changing `.env` — the URL is baked in at build time
- Check if Render is sleeping — open the `/health` endpoint in a browser first to wake it

### Render backend not responding
- Check Render dashboard logs for errors
- Verify `MONGODB_URI` env var is set correctly in Render
- Confirm MongoDB Atlas network access allows `0.0.0.0/0`

### Widgets not showing data
- Open the app and let it fully load — this triggers a widget sync
- Toggle any task to force a sync
- Widgets only update when the app is open; they don't poll independently

### APK install blocked on Android
- Go to **Settings → Security** (or **Settings → Apps → Special app access → Install unknown apps**)
- Allow installs from your file manager or browser
- This is a one-time setting

### EAS build fails
- Run `eas whoami` to confirm you're logged in
- Run `eas init` to confirm the project is linked
- Check that `app.json` has a valid `projectId` under `extra.eas`

---

## Deployment Checklist

### MongoDB Atlas
- [ ] Network access: `0.0.0.0/0` added
- [ ] Database user exists with read/write access

### Backend (Render)
- [ ] Root directory set to `chronos-zenith/backend`
- [ ] All 5 environment variables added
- [ ] `/health` endpoint returns `{ "status": "ok" }`

### Web (Vercel)
- [ ] Root directory set to `chronos-zenith/web-dev`
- [ ] `NEXT_PUBLIC_API_URL` set to Render URL
- [ ] Login works and tasks save correctly

### Mobile (APK)
- [ ] `mobile-dev/.env` updated with Render URL
- [ ] `mobile-dev/eas.json` updated with Render URL
- [ ] `eas init` run to link project
- [ ] APK built with `eas build --platform android --profile preview`
- [ ] APK installed on phone
- [ ] Login works with same account as web
- [ ] Both home screen widgets added and showing data
