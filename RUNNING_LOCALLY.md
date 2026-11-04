# Running My Caribbean Companion Locally

A step-by-step guide to getting the whole system running on your machine:
Next.js app, Supabase database and auth, and all external APIs.

> This file is git-ignored. It is a personal setup reference, not part of the repo.

---

## Quick start: run the server

Once the setup below is done (dependencies installed, `.env.local` filled in, migrations run), this is all you need each time:

```bash
npm ci          # only after pulling changes to package-lock.json
npm run dev     # start the server at http://localhost:3000
```

Stop the server with `Ctrl+C`. See [step 7](#7-run-the-server) for the production server and other options.

---

## 1. Install the tools

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 18.17 or newer | `node -v` |
| npm | comes with Node | `npm -v` |
| Git | any recent | `git --version` |

---

## 2. Get the code and install dependencies

```bash
git clone <repo-url> my-caribbean-companion
cd my-caribbean-companion
npm ci
```

`npm ci` installs the exact versions in `package-lock.json`. Use `npm install` only when adding a package.

---

## 3. Create your accounts and API keys

| Service | Used for | Where to get the key | Required? |
|---------|----------|----------------------|-----------|
| **Supabase** | Database, auth, API cache | supabase.com → New project → Project Settings → API | **Yes** |
| **Tavily** | Housing and cost-of-living search | app.tavily.com | **Yes** (the build fails without it) |
| **Google AI Studio** | Gemini AI Companion chat | aistudio.google.com → Get API key | For `/companion` |
| **RapidAPI (JSearch)** | Live job listings | rapidapi.com → subscribe to JSearch | For live jobs (curated links still show without it) |
| **ExchangeRate-API** | Currency conversion | exchangerate-api.com | For the cost estimator and comparison |
| **CaribGov** | Government contacts in the Resources pages | CaribGov API portal | For `/resources` contacts |

`AMADEUS_API_KEY` and `AMADEUS_API_SECRET` appear in `.env.example`, but no code uses them yet. Leave them blank.

---

## 4. Create `.env.local`

Copy the example file:

```bash
cp .env.example .env.local
```

Fill it in. **`TAVILY_API_KEY` is missing from `.env.example`, so add it yourself:**

```env
# AI
GOOGLE_AI_API_KEY=your-gemini-key

# Supabase (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Search
TAVILY_API_KEY=tvly-xxxxxxxx

# Other APIs
CARIBGOV_API_KEY=
EXCHANGE_RATE_API_KEY=
RAPIDAPI_KEY=

# Not used yet
AMADEUS_API_KEY=
AMADEUS_API_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Keep the service role key secret.** It bypasses row-level security and is used only on the server, for the API cache. Never prefix it with `NEXT_PUBLIC_`.

---

## 5. Set up the Supabase database

In the Supabase dashboard, open **SQL Editor**. Paste and run each migration **in order**:

| # | File | What it creates |
|---|------|-----------------|
| 1 | `supabase/migrations/001_initial_schema.sql` | `profiles`, `plans`, `checklist_items`, RLS policies, auto-create-profile trigger |
| 2 | `supabase/migrations/002_api_cache.sql` | `api_cache` table for external API responses |
| 3 | `supabase/migrations/003_user_dashboard.sql` | Profile fields (current country, date of birth), plan labels, active-plan tracking, delete policies |
| 4 | `supabase/migrations/004_signup_profession.sql` | Copies the profession chosen at signup into the new profile |

Run each file once. Running 001 again fails because the tables already exist.

**Check:** under **Table Editor** you should see `profiles`, `plans`, `checklist_items` and `api_cache`.

---

## 6. Configure Supabase Auth

In **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** add `http://localhost:3000/**` (password reset links land on `/auth/callback`, so this must be set or reset emails will not work)

In **Authentication → Providers → Email**:

- Email is enabled by default.
- Signup sends a confirmation email. To skip that step while developing, turn off **Confirm email**. Turn it back on for production.

---

## 7. Run the server

### Development server (use this day to day)

```bash
npm run dev
```

Open http://localhost:3000. The page reloads automatically when you save a file. Stop the server with `Ctrl+C`.

If port 3000 is taken:

```bash
npm run dev -- -p 3001
```

**Restart the dev server after any change to `.env.local`.** Environment variables are read only at startup.

### Production server (to test the real build)

```bash
npm run build   # needs all env vars set, including SUPABASE_SERVICE_ROLE_KEY
npm run start   # serves the build at http://localhost:3000
```

This runs the app the way Vercel does, with no auto-reload. Run `npm run build` again after every code change.

---

## 8. Walk through the system

Test each part in this order:

### Guest flow
1. **Home** (`/`): the page loads with the navbar and the AI bubble.
2. **Plan My Move** (`/onboarding`): pick a home country, destination and profession, then click **Generate My Plan**. This calls `POST /api/plan`.
3. **Dashboard** (`/dashboard`): the plan, checklist and timeline appear. Tick a few checklist items. They are saved to localStorage.
4. **Tabs** on the dashboard:
   - Cost Estimator → `POST /api/cost-estimate`
   - Job Opportunities → `GET /api/jobs`
   - Housing Discovery → `GET /api/housing`
5. **Export as PDF**: a PDF of the plan downloads.

### Research pages
6. `/compare`: country comparison table and charts (`/api/compare`, `/api/exchange-rates`).
7. `/jobs`, `/housing`, `/cost-estimate`: full versions of the dashboard tabs.
8. `/resources` and `/resources/BB`: CSME documents and government contacts (`/api/documents`).
9. `/companion`, or the floating bubble: send a message to test Gemini chat (`POST /api/chat`).

### Signed-in flow (personal dashboard)
10. **Sign up** (`/signup`): create an account and confirm the email if confirmation is on.
11. **Log in** (`/login`): the guest plan from step 2 is merged into Supabase, and you land on `/dashboard`.
12. **Personal dashboard** should show:
    - A profile header with your name, home country and plan count
    - **My plans**, with your plan and its checklist progress
    - The checklist ticks you made as a guest
13. Tick another item, **log out**, then **log back in**. The tick should still be there, now loaded from Supabase.
14. **New plan**: create a second plan and switch between the two cards.
15. **Delete** a plan using the trash icon.
16. **Edit profile** (`/dashboard/profile`): set your profession and save. The next **New plan** should pre-fill it.

**Check in Supabase:** under **Table Editor**, `plans` and `checklist_items` should contain rows for your user.

---

## 9. Optional checks

```bash
npx tsc --noEmit        # type check
npm run lint            # ESLint
npm run build           # production build (needs all env vars set)
npm run start           # serve the production build on :3000
```

Check auth state in Supabase (this reads `.env.local`):

```bash
node scripts/verify-phase4.mjs recent            # 5 most recent users
node scripts/verify-phase4.mjs trigger           # check the profile auto-create trigger
node scripts/verify-phase4.mjs you@example.com   # check one user
```

---

## 10. Deploying to Vercel

1. Import the GitHub repo in Vercel.
2. Add every variable from `.env.local` under **Settings → Environment Variables**, with `NEXT_PUBLIC_SITE_URL` set to the Vercel URL.
3. In Supabase **Authentication → URL Configuration**, add the Vercel URL to **Site URL** and **Redirect URLs**.
4. Deploy. API routes run as Vercel serverless functions, so no separate backend is needed.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing Supabase env vars` or `Your project's URL and Key are required` | Check `.env.local`, then restart `npm run dev` |
| Build fails with `No API key provided … TAVILY_API_KEY` | Add `TAVILY_API_KEY` to `.env.local` |
| Build fails with `supabaseKey is required` | Set `SUPABASE_SERVICE_ROLE_KEY` |
| Dashboard shows "We couldn't load your dashboard" when signed in | Migration `003_user_dashboard.sql` hasn't been run |
| Signup works but login says email not confirmed | Click the confirmation email, or turn off **Confirm email** in Supabase |
| Password reset email never arrives | Supabase's built-in email sender allows only a few emails per hour. Wait, check spam, or set up custom SMTP under **Authentication → Emails** |
| Reset link says "invalid or has expired" | Links work once, for 1 hour, and must be opened in the same browser that requested them. Request a new one |
| Stale chunk errors on `/dashboard` or `/compare` | `rm -rf .next` then `npm run dev` |
| Gemini returns 429 | Free tier limit (15 requests/min). Wait a minute or lower the limit in `/api/chat` |
| Housing shows no live rent figures | Expected. The page falls back to `data/housing-links.json` |
| Jobs tab shows only links | JSearch key missing or quota used up. The curated links are the fallback |
