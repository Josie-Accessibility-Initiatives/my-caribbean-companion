# My Caribbean Companion

Your guide to working anywhere in the Caribbean.

My Caribbean Companion helps CARICOM citizens 
understand and navigate the process of legally 
relocating for work under the CSME Free Movement 
of Skills framework. It centralizes fragmented 
government information and provides personalized 
relocation plans, cost estimates, job listings, 
housing resources, and AI-powered guidance.

**Live app:** [my-caribbean-companion.vercel.app](https://my-caribbean-companion.vercel.app)

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
- **CSME Basics** — plain-language explainer of the CSME Free Movement of Skills framework, eligibility categories, and required documents
- **Fraud Alert System** — warnings about common Caribbean relocation scams

### User Features
- **Auth** — Supabase Auth with email/magic link, guest mode with localStorage fallback
- **Plan Persistence** — guest plans auto-merge to Supabase on signup/login
- **PDF Roadmap Export** — downloadable personalized relocation plan
- **Community Stories** — anonymous peer migration stories *(coming soon)*
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

## Project structure
my-caribbean-companion/
├── app/
│   ├── layout.tsx              ← global layout, Navbar, Footer, AI bubble
│   ├── page.tsx                ← home / landing page
│   ├── not-found.tsx           ← custom 404 page
│   ├── onboarding/             ← CSME move planner wizard
│   ├── dashboard/              ← checklist, cost estimate, job/housing preview
│   ├── compare/                ← country comparison dashboard
│   ├── companion/              ← AI chatbot (Gemini)
│   ├── jobs/                   ← Caribbean job board
│   ├── housing/                ← housing discovery
│   ├── cost-estimate/          ← relocation cost estimator
│   ├── resources/              ← document hub + country detail pages
│   ├── csme-basics/            ← CSME framework explainer + document categories
│   ├── community/              ← community stories (coming soon)
│   ├── about/                  ← about page
│   ├── contact/                ← contact page
│   ├── login/                  ← Supabase Auth login
│   ├── signup/                 ← Supabase Auth signup
│   └── api/
│       ├── plan/               ← POST — generate CSME plan
│       ├── countries/          ← GET — CARICOM country list
│       ├── categories/         ← GET — CSME profession categories
│       ├── chat/               ← POST — Gemini AI chat (streaming)
│       ├── cost-estimate/      ← POST — relocation cost breakdown
│       ├── compare/            ← GET — country comparison data
│       ├── jobs/               ← GET — job listings (JSearch)
│       ├── housing/            ← GET — housing data (Tavily)
│       ├── documents/          ← GET — CSME documents by country/category
│       └── exchange-rates/     ← GET — live currency rates
│
├── components/
│   ├── auth/
│   │   └── AuthProvider.tsx        ← Supabase Auth context + session sync
│   ├── nav/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── AICompanionBubble.tsx   ← floating chat button
│   ├── ui/                         ← shared UI primitives
│   │   ├── BackButton.tsx
│   │   ├── ErrorCard.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── PlanCTACard.tsx
│   │   ├── SectionHeader.tsx
│   │   └── Skeleton.tsx
│   ├── wizard/                     ← onboarding wizard steps
│   ├── dashboard/                  ← checklist, cost widget, save plan banner
│   ├── compare/                    ← comparison table, charts, heatmap
│   ├── jobs/                       ← job cards, curated links
│   ├── housing/                    ← rent overview, neighborhoods, links
│   ├── resources/                  ← fraud alert
│   └── companion/                  ← ChatWidget
│
├── lib/
│   ├── ai.ts                   ← Gemini client, system prompts, extractJSON
│   ├── api.ts                  ← typed fetch helpers for internal API routes
│   ├── badge.ts                ← document type badge config
│   ├── cache.ts                ← Supabase api_cache utilities
│   ├── constants.ts            ← app-wide constants
│   ├── country-utils.ts        ← country lookup helpers
│   ├── currency.ts             ← USD → local currency conversion
│   ├── cost-search.ts          ← Tavily flight + cost of living search
│   ├── exchange-rates.ts       ← ExchangeRate-API integration
│   ├── format.ts               ← number/currency formatters
│   ├── pdfExport.ts            ← PDF generation for relocation roadmap
│   ├── persistence.ts          ← localStorage + Supabase data layer
│   ├── tavily.ts               ← Tavily search client
│   ├── supabase/
│   │   ├── client.ts           ← browser Supabase client
│   │   ├── server.ts           ← SSR Supabase client
│   │   └── admin.ts            ← service role client (server only)
│   ├── external/
│   │   ├── caribgov.ts         ← CaribGov API (competent authority contacts)
│   │   ├── worldbank.ts        ← World Bank economic data
│   │   ├── rest-countries.ts   ← country flags, currencies, languages
│   │   ├── quality-of-life.ts  ← Tavily QoL search
│   │   ├── jsearch.ts          ← RapidAPI job search
│   │   └── housing-search.ts   ← Tavily housing search
│   └── types/
│       ├── comparison.ts       ← CountryComparisonData type
│       ├── csme.ts             ← CSMEComplexity type
│       ├── documents.ts        ← CSMEDocument + DocumentType types
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
| `/api/cost-estimate` | POST | Full relocation cost breakdown |
| `/api/compare` | GET | Country comparison data |
| `/api/jobs` | GET | Job listings by country + profession |
| `/api/housing` | GET | Housing data by country |
| `/api/documents` | GET | CSME documents by country/category |
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
