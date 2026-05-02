# Chronos Zenith — Deployment Context Prompt

> Paste this entire prompt to any AI IDE (Kiro, Cursor, Copilot, etc.) when asking for deployment help.  
> It gives the AI full context about the codebase so it can give accurate, project-specific answers.

---

## Prompt

I have a full-stack app called **Chronos Zenith** — a timeline-based daily task tracker with a streak scoring system. I need help deploying it so I can access it from both web (browser) and mobile (Android APK installed on my phone), with both platforms sharing the same cloud MongoDB database. The deployment must be free (I am the only user).

---

### Project Structure

```
chronos-zenith/
├── backend/          # Node.js + Express REST API
├── web-dev/          # Next.js 14 web app
└── mobile-dev/       # Expo React Native app (bare workflow, has native Android code)
```

---

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Mongoose, MongoDB Atlas |
| Web | Next.js 14, React 18, Tailwind CSS, Zustand, React Query (TanStack) |
| Mobile | Expo SDK 55, React Native 0.83, TypeScript, expo-router, bare workflow |
| Auth | JWT (stored in localStorage on web, AsyncStorage on mobile) |
| State | Zustand (web + mobile) |

---

### Backend Details

**Entry point**: `backend/src/server.js`  
**Port**: `process.env.PORT || 5002`  
**Start command**: `npm start` (runs `node src/server.js`)  
**Build command**: `npm install` (no transpile step needed)

**API Routes** (all prefixed at root, no `/api` prefix):
```
POST   /auth/register     — register new user
POST   /auth/login        — login, returns JWT
GET    /auth/me           — get current user (requires Bearer token)

GET    /tasks/range       — get tasks by date range (?start=YYYY-MM-DD&end=YYYY-MM-DD)
GET    /tasks/:date       — get tasks for a specific date (YYYY-MM-DD)
POST   /tasks             — create task { title, date? }
PUT    /tasks/:id         — update task { title, date }
PATCH  /tasks/:id         — toggle task completion (also recalculates stats + streak)
DELETE /tasks/:id         — delete task

GET    /stats/history     — get last N days of stats (?limit=30)
GET    /stats/:date       — get stats for a specific date

GET    /health            — health check, returns { status: "ok", app: "Chronos Zenith" }
```

**All task and stats routes require**: `Authorization: Bearer <jwt_token>` header.

**IMPORTANT route order**: `/stats/history` must be registered BEFORE `/stats/:date` to avoid Express treating "history" as a date param. This is already correct in the code.

**MongoDB Models**:
- `User` — email, password (bcrypt), currentStreak, lastCompletedDate, totalRating, totalTasksCompleted, totalTasksAssigned
- `Task` — userId (ref), title, date (YYYY-MM-DD string), time (HH:MM string, nullable), isCompleted
- `DailyStats` — userId (ref), date (YYYY-MM-DD), totalTasks, completedTasks, totalScore, achievedScore, bonusApplied. Unique index on `{ userId, date }`.

**Scoring logic** (in `backend/src/services/stats.service.js`):
- Each task = 1 point
- Streak bonus = +1 point when all tasks completed for 2 consecutive days
- `recalculateStats(userId, date)` is called after every task create/toggle/delete/update

**Environment variables required**:
```
PORT=5002
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<random 64-char hex string>
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

---

### Web App Details

**Framework**: Next.js 14 (App Router)  
**Root**: `web-dev/`  
**Dev command**: `npm run dev`  
**Build command**: `npm run build`  
**Start command**: `npm start`

**API client**: `web-dev/src/lib/api.ts`  
- Uses `axios`  
- Base URL from `process.env.NEXT_PUBLIC_API_URL`  
- JWT token read from `localStorage` key `cz-auth` (Zustand persisted store)

**Environment variable required**:
```
NEXT_PUBLIC_API_URL=https://<your-render-subdomain>.onrender.com
```

**Auth storage**: Zustand store persisted to `localStorage` under key `cz-auth`. Token is attached to every API request via axios interceptor.

---

### Mobile App Details

**Framework**: Expo SDK 55, bare workflow (has `android/` and `ios/` native folders)  
**Root**: `mobile-dev/`  
**Package**: `com.chronoszenith.app`  
**Bundle ID (iOS)**: `com.chronoszenith.app`  
**Expo slug**: `chronos-zenith`

**API client**: `mobile-dev/src/lib/api.ts`  
- Uses `axios`  
- Base URL from `process.env.EXPO_PUBLIC_API_URL`  
- JWT token read from `AsyncStorage` key `cz_token`

**Environment variable required** (baked in at build time):
```
EXPO_PUBLIC_API_URL=https://<your-render-subdomain>.onrender.com
```

**Auth storage**: Zustand store (`mobile-dev/src/store/authStore.ts`) persisted to `AsyncStorage` under keys `cz_token` and `cz_user`.

**Screens**:
- `app/(auth)/login.tsx` — login screen
- `app/(auth)/register.tsx` — register screen  
- `app/(tabs)/home.tsx` — main timeline screen with calendar strip, score widget, task list
- `app/(tabs)/analytics.tsx` — 14-day history with bar chart

**Key hooks**:
- `src/hooks/useTasksRange.ts` — fetches tasks for a date range, handles optimistic updates
- `src/hooks/useWidgetSync.ts` — syncs data to Android home screen widgets via native bridge

---

### Android Home Screen Widgets (IMPORTANT)

The app has **real native Android home screen widgets** — not just in-app UI components.

**Two widgets**:
1. **Timeline Widget** (`TimelineWidgetProvider.java`) — shows today's tasks with completion circles
2. **Score Widget** (`ScoreWidgetProvider.java`) — shows today's score, streak badge, progress bar

**Native files** (in `mobile-dev/android/app/src/main/java/com/chronoszenith/app/widgets/`):
- `WidgetModule.java` — React Native native module, exposes `updateWidgets()` and `refreshWidgets()` to JS
- `WidgetPackage.java` — registers WidgetModule with React Native
- `WidgetDataStore.java` — SharedPreferences bridge between JS and widget providers
- `TimelineWidgetProvider.java` — Android AppWidgetProvider for timeline widget
- `ScoreWidgetProvider.java` — Android AppWidgetProvider for score widget
- `ProgressRingDrawable.java` — custom drawable for score ring

**Widget layouts** (in `mobile-dev/android/app/src/main/res/layout/`):
- `widget_timeline.xml`
- `widget_score.xml`

**Widget metadata** (in `mobile-dev/android/app/src/main/res/xml/`):
- `timeline_widget_info.xml`
- `score_widget_info.xml`

**Both widgets are declared in `AndroidManifest.xml`** with their intent filters.

**Data flow**:
```
App loads / task toggled
  → useWidgetSync hook (TypeScript)
  → NativeModules.WidgetModule.updateWidgets() (JS → Java bridge)
  → WidgetDataStore.saveWidgetData() (writes to SharedPreferences)
  → TimelineWidgetProvider.refreshAll() + ScoreWidgetProvider.refreshAll()
  → Android OS redraws home screen widgets
```

**Widgets do NOT make network requests**. They display data pushed from the app. To get fresh data, the user opens the app.

**Widget sync is a no-op on iOS and Expo Go** — the `useWidgetSync` hook checks `Platform.OS === 'android' && !!WidgetModule` before calling native methods.

---

### Build Method: EAS Build (Expo Application Services)

Because the app uses **bare workflow** (has native `android/` folder with custom Java widget code), it **cannot** be built with Expo Go or classic `expo build`. It **must** use EAS Build.

**EAS config**: `mobile-dev/eas.json`

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://<render-url>.onrender.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://<render-url>.onrender.com"
      }
    }
  }
}
```

**Build command for APK** (no Play Store needed):
```bash
cd mobile-dev
eas build --platform android --profile preview
```

**Why `preview` profile**: The `preview` profile sets `buildType: apk` which produces a direct-install `.apk` file. The `production` profile produces an `.aab` (Android App Bundle) which requires the Play Store.

---

### Deployment Targets

| Layer | Service | Why |
|---|---|---|
| Backend | **Render** (free tier) | Supports Node.js, persistent env vars, auto-deploy from GitHub |
| Web | **Vercel** (free hobby) | Native Next.js support, auto-deploy from GitHub |
| Mobile | **EAS Build** (free personal) | Only option for bare workflow Expo apps with native code |
| Database | **MongoDB Atlas M0** (free) | Already configured, 512MB free tier |

---

### Known Constraints

1. **Render free tier sleeps** after 15 minutes of inactivity. First request after sleep takes ~30 seconds. This is acceptable for a single user.

2. **EXPO_PUBLIC_API_URL is baked in at build time**. If the Render URL changes, a new APK must be built.

3. **Widgets only update when the app is open**. There is no background sync service. This is intentional — no battery drain.

4. **iOS widgets are not implemented**. The native widget code is Android-only. iOS would require a separate WidgetKit extension in Swift.

5. **The app uses bare workflow**, not managed workflow. This means `expo-dev-client` is used instead of Expo Go, and all native code changes require a new EAS build.

6. **CORS is open** (`app.use(cors())` with no origin restriction). This is fine for a personal single-user app but should be restricted if ever made public.

---

### Files to Update Before Building

When deploying, these files need the real Render URL:

| File | Key | Current value |
|---|---|---|
| `mobile-dev/.env` | `EXPO_PUBLIC_API_URL` | `https://YOUR_RENDER_APP_NAME.onrender.com` |
| `mobile-dev/eas.json` | `env.EXPO_PUBLIC_API_URL` (all 3 profiles) | `https://YOUR_RENDER_APP_NAME.onrender.com` |
| `mobile-dev/src/lib/api.ts` | fallback URL in `BASE_URL` | `https://YOUR_RENDER_APP_NAME.onrender.com` |
| `web-dev/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:5002` → Render URL |

---

### Quick Verification Steps

After deployment, verify each layer:

```bash
# 1. Backend health check
curl https://<render-url>.onrender.com/health
# Expected: {"status":"ok","app":"Chronos Zenith"}

# 2. Backend auth test
curl -X POST https://<render-url>.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
# Expected: {"success":true,"token":"...","user":{...}}
```

For web: open the Vercel URL, register, add a task, confirm it persists on refresh.

For mobile: install APK, log in with the same account used on web, confirm tasks are shared.

For widgets: long-press home screen → Widgets → find "Chronos Zenith" → add Timeline or Score widget.
