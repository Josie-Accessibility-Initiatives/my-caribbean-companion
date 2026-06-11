# My Caribbean Companion

Your guide to working anywhere in the Caribbean.

My Caribbean Companion helps CARICOM citizens 
understand and navigate the process of legally 
relocating for work under the CSME Free Movement 
of Skills framework. It centralizes fragmented 
government information and provides personalized 
relocation plans, cost estimates, job listings, 
housing resources, and AI-powered guidance.

**Live app:** [my-caribbean-companion.vercel.app](#)

---

## Features

### Core
- **Move Planner Wizard** — personalized CSME relocation plan based on home country, destination, and profession
- **Relocation Readiness Score** — weighted scoring across documentation, employment, financial, housing, and profile completeness
- **Step-by-Step Checklist** — interactive checklist with Supabase persistence for logged-in users
- **AI Companion** — Gemini-powered chatbot grounded in CSME policy, floating bubble on every page

### Research & Discovery
- **Country Comparison Dashboard** — compare GDP, cost of living, safety, healthcare, and CSME complexity across all 12 CARICOM countries with live currency conversion
- **Caribbean Job Board** — live job listings via JSearch (RapidAPI) matched to profession and destination, with curated fallback links
- **Housing Discovery** — Tavily-powered rental data, neighborhood guides, Facebook housing groups, and Booking.com integration
- **Relocation Cost Estimator** — line-by-line cost breakdown (flights, housing, documents, living expenses) with live currency conversion via ExchangeRate-API

### Document Hub
- **Resources Page** — country-by-country CSME documents, competent authority contacts via CaribGov API, official immigration links
- **Fraud Alert System** — warnings about common Caribbean relocation scams

### User Features
- **Auth** — Supabase Auth with email/magic link, guest mode with localStorage fallback
- **Plan Persistence** — guest plans auto-merge to Supabase on signup/login
- **PDF Roadmap Export** — downloadable personalized relocation plan *(Phase 10)*
- **Community Stories** — anonymous peer migration stories *(Phase 13)*
- **Application Status Tracker** — user-driven CSME application tracking *(Phase 14)*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + plain CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Cache | Supabase api_cache table |
| AI | Google Gemini (gemini-2.5-flash) |
| Web Search | Tavily API |
| Jobs | JSearch via RapidAPI |
| Currency | ExchangeRate-API |
| Gov Contacts | CaribGov API |
| Charts | Recharts |
| Icons | Lucide React |
| Deploy | Vercel (frontend + API routes) |

---

## Prerequisites

- Node.js 18.17+
- npm
- Supabase project
- Google AI Studio account (Gemini)
- Tavily account
- RapidAPI account (JSearch)
- ExchangeRate-API account
- CaribGov API key

---

## 1. Clone and install

```bash
git clone https://github.com/your-org/my-caribbean-companion
cd my-caribbean-companion
npm install
```

---

## 2. Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GOOGLE_AI_API_KEY=your-gemini-api-key

# Tavily (web search — flights, cost of living, housing)
TAVILY_API_KEY=tvly-your-key

# ExchangeRate-API (live currency conversion)
EXCHANGE_RATE_API_KEY=your-32-char-key

# RapidAPI — JSearch (job listings)
RAPIDAPI_KEY=your-rapidapi-key

# CaribGov (government contacts — Phase 9)
CARIBGOV_API_KEY=cgd_your-key

# Site URL (production only)
NEXT_PUBLIC_SITE_URL=https://mycaribbeancompanion.com
```

**Security notes:**
- Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_` — it bypasses Row Level Security
- Never prefix `GOOGLE_AI_API_KEY` or any secret key with `NEXT_PUBLIC_`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose — RLS protects your data

---

## 3. Database setup

Run these migrations in the Supabase SQL editor 
in order:

```bash
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_api_cache.sql
```

Or copy-paste from each file into 
the Supabase SQL editor.

Tables created:
- `profiles` — user profiles (auto-created on signup)
- `plans` — saved relocation plans
- `checklist_items` — per-plan checklist state
- `api_cache` — shared cache for all external API responses

---

## 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build in `.next/` |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |

---

## Project structure
my-caribbean-companion/
├── app/
│   ├── layout.tsx              ← global layout, Navbar, Footer, AI bubble
│   ├── page.tsx                ← home / landing page
│   ├── onboarding/             ← CSME move planner wizard
│   ├── dashboard/              ← readiness score, checklist, cost estimate
│   ├── compare/                ← country comparison dashboard
│   ├── companion/              ← AI chatbot (Gemini)
│   ├── jobs/                   ← Caribbean job board
│   ├── housing/                ← housing discovery
│   ├── cost-estimate/          ← relocation cost estimator
│   ├── resources/              ← document hub + country detail pages
│   ├── about/                  ← about page
│   ├── contact/                ← contact page
│   ├── login/                  ← Supabase Auth login
│   ├── signup/                 ← Supabase Auth signup
│   └── api/
│       ├── plan/               ← POST — generate CSME plan
│       ├── countries/          ← GET — CARICOM country list
│       ├── categories/         ← GET — CSME profession categories
│       ├── chat/               ← POST — Gemini AI chat (streaming)
│       ├── score/              ← POST — readiness score + Gemini narrative
│       ├── cost-estimate/      ← POST — relocation cost breakdown
│       ├── compare/            ← GET — country comparison data
│       ├── jobs/               ← GET — job listings (JSearch)
│       ├── housing/            ← GET — housing data (Tavily)
│       └── exchange-rates/     ← GET — live currency rates
│
├── components/
│   ├── nav/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── AICompanionBubble.tsx   ← floating chat button
│   ├── wizard/                     ← onboarding wizard steps
│   ├── dashboard/                  ← score card, checklist, cost widget
│   ├── compare/                    ← comparison table, charts, heatmap
│   ├── jobs/                       ← job cards, curated links
│   ├── housing/                    ← rent overview, neighborhoods, links
│   └── companion/                  ← ChatWidget
│
├── lib/
│   ├── ai.ts                   ← Gemini client, system prompts, extractJSON
│   ├── cache.ts                ← Supabase api_cache utilities
│   ├── currency.ts             ← USD → local currency conversion
│   ├── cost-search.ts          ← Tavily flight + cost of living search
│   ├── exchange-rates.ts       ← ExchangeRate-API integration
│   ├── persistence.ts          ← localStorage + Supabase data layer
│   ├── scoring.ts              ← readiness score engine
│   ├── tavily.ts               ← Tavily search client
│   ├── eligibility.ts          ← CSME rules engine
│   ├── supabase/
│   │   ├── client.ts           ← browser Supabase client
│   │   ├── server.ts           ← SSR Supabase client
│   │   └── admin.ts            ← service role client (server only)
│   ├── external/
│   │   ├── worldbank.ts        ← World Bank economic data
│   │   ├── rest-countries.ts   ← country flags, currencies, languages
│   │   ├── quality-of-life.ts  ← Tavily QoL search
│   │   ├── jsearch.ts          ← RapidAPI job search
│   │   └── housing-search.ts   ← Tavily housing search
│   └── types/
│       ├── comparison.ts       ← CountryComparisonData type
│       ├── csme.ts             ← CSMEComplexity type
│       ├── housing.ts          ← housing data types
│       └── jobs.ts             ← job listing types
│
├── data/
│   ├── countries.json          ← 12 CARICOM countries (code, name, URLs)
│   ├── categories.json         ← CSME profession categories
│   ├── countryMeta.ts          ← rich country data (capital, airport, QoL)
│   ├── cost-estimates.json     ← hardcoded relocation costs per country
│   ├── csme-complexity.json    ← CSME processing complexity per country
│   ├── job-links.json          ← curated Caribbean job board links
│   └── housing-links.json      ← curated housing links + Facebook groups
│
└── supabase/
└── migrations/
├── 001_initial_schema.sql
└── 002_api_cache.sql


---

## API routes reference

| Route | Method | Description |
|-------|--------|-------------|
| `/api/plan` | POST | Generate CSME relocation plan |
| `/api/countries` | GET | List of 12 CARICOM countries |
| `/api/categories` | GET | CSME profession categories |
| `/api/chat` | POST | Gemini AI chat with streaming |
| `/api/score` | POST | Readiness score + Gemini narrative |
| `/api/cost-estimate` | POST | Full relocation cost breakdown |
| `/api/compare` | GET | Country comparison data |
| `/api/jobs` | GET | Job listings by country + profession |
| `/api/housing` | GET | Housing data by country |
| `/api/exchange-rates` | GET | Live Caribbean currency rates |

---

## Caching strategy

All external API responses are cached in the 
Supabase `api_cache` table to minimize API 
credit usage:

| Data type | Cache TTL | Cache key pattern |
|-----------|-----------|-------------------|
| Exchange rates | 24 hours | `exchange_rates:usd` |
| Flight estimates | 7 days | `flights:TT:BB` |
| Cost of living | 7 days | `col:BB` |
| Housing data | 7 days | `housing:BB` |
| Quality of life | 7 days | `qol:BB` |
| Job listings | 14 days | `jobs:jsearch:BB:nurse:page1` |
| World Bank data | 30 days | `worldbank:BB` |
| REST Countries | 30 days | `restcountry:BB` |

---

## CARICOM countries supported

| Code | Country |
|------|---------|
| TT | Trinidad and Tobago |
| BB | Barbados |
| JM | Jamaica |
| GY | Guyana |
| LC | Saint Lucia |
| GD | Grenada |
| DM | Dominica |
| VC | St. Vincent and the Grenadines |
| KN | St. Kitts and Nevis |
| AG | Antigua and Barbuda |
| SR | Suriname |
| BZ | Belize |

---

## Troubleshooting

**`Error: Missing Supabase env vars`**
Confirm `.env.local` exists with real values 
and restart the dev server.

**`Error: Your project's URL and Key are required`**
Same as above — the middleware reads env vars 
on startup. Restart after any `.env.local` change.

**Port 3000 in use**
```bash
npm run dev -- -p 3001
```

**Stale vendor chunk errors on /dashboard or /compare**
```bash
rm -rf .next
npm run dev
```

**Gemini 429 (rate limit)**
The free tier allows 15 requests/minute. 
The in-memory rate limiter in `/api/chat` 
caps at 20 requests/minute per IP — 
reduce if hitting Gemini limits.

**Tavily returning null rent data**
Expected behavior — Tavily domain filtering 
for housing returns tips and temporary options 
but rarely structured rent figures. 
The UI falls back to static data from 
`data/housing-links.json` automatically.

---

## Roadmap

- [ ] Phase 6 — Readiness Score Engine
- [ ] Phase 13 — Community & Peer Stories
- [ ] Phase 14 — Application Status Tracker
- [ ] Phase 15 — Multi-language Support (FR, ES, HT, NL)
- [ ] Phase 16 — Production Readiness (Redis, Sentry, SEO)

---

## License
