# Lisa's Custom Keychains — Storefront

Production: [lisascustomkeychains.com](https://www.lisascustomkeychains.com)  
Shopify Store: `jgvme0-av.myshopify.com`  
Vercel Project: `invisionedmarketing/lisa-custom-keychains-com`

---

## Overview

Headless Next.js storefront for Lisa's Custom Keychains — a handmade macrame keychain and earring business. Products live in Shopify; this repo is the customer-facing site, customization UI, and owner control panel.

**46 live products** across three tiers:
- Basic keychains — $2.95
- Standard keychains — $5.95
- Epic/custom keychains — $9.95
- Earrings — $6.95–$15.00

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + custom Chromium Purple theme |
| Fonts | Playfair Display, Quicksand (Google Fonts) |
| Commerce | Shopify Storefront GraphQL API |
| Validation | Zod 4 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Testing | Vitest |
| Deployment | Vercel (git-push-to-deploy on `main`) |

---

## Local Development

### Prerequisites

- Node.js 20+
- npm or pnpm

### Setup

```bash
git clone <repo>
cd LisaCustomKeychains.com
npm install
cp .env.example .env.local
# Fill in required env vars (see below)
npm run dev
```

Dev server starts at **http://localhost:3000** with Turbopack hot-reload.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run shopify:sync` | Sync product mocks from Shopify |

---

## Environment Variables

### Required (public — safe to expose in browser)

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=jgvme0-av.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN=jgvme0-av.myshopify.com
```

### Server-Only (never exposed to browser)

```env
# Owner dashboard — protects /editor and /client-editor
OWNER_DASHBOARD_PASSWORD=your-strong-password-here
OWNER_DASHBOARD_SECRET=your-long-random-session-secret

# Shopify Admin API (optional — only needed for write operations)
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_...
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...

# Cron job gate
CRON_SECRET=...
```

> In Vercel production all env vars are set under  
> Settings → Environment Variables for the `invisionedmarketing` team project.

---

## Project Structure

```
LisaCustomKeychains.com/
├── data/                          # JSON config (version-controlled, editable via UI)
│   ├── storefront-config.json     # Homepage content — edit via /client-editor
│   ├── ad-mockups.json            # 18 ad copy templates for /editor/ads
│   ├── events.json                # Pop-up event schedule
│   └── content-queue.json         # Scheduled social/marketing content
│
├── public/
│   └── images/                    # Product photos, mockups, sports themes
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout — fonts, providers, StorefrontShell
│   │   ├── page.tsx               # Homepage (ISR 1h)
│   │   ├── product/[handle]/      # Product detail pages (ISR 1h, 46 pre-rendered)
│   │   ├── customize/             # Live product customization UI
│   │   ├── sports/                # Sports charm showcase
│   │   ├── editor/                # Owner Command Center (auth-gated)
│   │   │   ├── page.tsx           # Dashboard — content calendar, events, quick links
│   │   │   ├── ContentCalendar.tsx
│   │   │   ├── AdGallery.tsx
│   │   │   └── ads/page.tsx       # Ad mockup gallery with copy-to-clipboard
│   │   ├── client-editor/         # Storefront config editor (auth-gated)
│   │   │   ├── page.tsx           # Edit hero, products, sections, social links
│   │   │   ├── actions.ts         # Server actions: login, logout, publish
│   │   │   └── login/page.tsx     # Password login page
│   │   └── api/
│   │       ├── storefront-config/ # GET current config JSON
│   │       ├── content-queue/     # GET + PATCH content queue
│   │       └── cron/generate-content/ # Daily content stub (CRON_SECRET gated)
│   │
│   ├── components/
│   │   ├── StorefrontShell.tsx    # Suppresses CartDrawer+Footer on admin routes
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartProvider.tsx       # Cart context (Shopify Storefront cart API)
│   │   ├── CartDrawer.tsx         # Slide-out cart
│   │   ├── Footer.tsx
│   │   ├── SocialFeedSection.tsx  # Meta fallback feed
│   │   ├── EventsSection.tsx
│   │   └── customize/             # Keychain, earring, set customizer components
│   │
│   └── lib/
│       ├── shopify.ts             # Storefront GraphQL client
│       ├── shopify/mocks.ts       # Auto-synced product catalog (all 46 products)
│       ├── storefront-config.ts   # Config read/write + auth (Zod schema, sessions)
│       ├── calendar.ts            # getUpcomingPopups() — reads data/events.json
│       ├── vibeEngine.ts          # Customization mood/vibe algorithm
│       └── camelot/               # Internal validation framework (Zod wrappers)
```

---

## Routes

| Route | Render | Auth | Description |
|---|---|---|---|
| `/` | ISR 1h | Public | Homepage |
| `/product/[handle]` | ISR 1h | Public | Product detail (46 pre-rendered paths) |
| `/customize` | ISR 1h | Public | Live keychain/earring designer |
| `/sports` | ISR 1h | Public | Sports charm collection |
| `/editor` | Dynamic | Owner | Command Center — content calendar, events, quick links |
| `/editor/ads` | Dynamic | Owner | Ad Gallery — 18 mockups with one-click caption copy |
| `/client-editor` | Dynamic | Owner | Storefront editor — hero, products, sections, social |
| `/client-editor/login` | Dynamic | — | Password login |
| `/api/storefront-config` | Dynamic | — | GET storefront config |
| `/api/content-queue` | Dynamic | — | GET/PATCH content queue |
| `/api/cron/generate-content` | Dynamic | CRON_SECRET | Daily content generation |
| `/sitemap.xml` | Dynamic | — | Auto-generated XML sitemap |

---

## Auth System

Both `/editor` and `/client-editor` share a single owner session:

- **Login**: Password → compared against `OWNER_DASHBOARD_PASSWORD` → SHA-256 session token set as cookie
- **Cookie**: `lisa_owner_session` — httpOnly, sameSite=lax, secure in production, 8hr TTL
- **Logout**: `logoutOwner` server action deletes cookie, redirects to `/client-editor/login`
- **Validation**: `isOwnerSessionValid()` in `src/lib/storefront-config.ts`

---

## Storefront Config

All homepage copy, featured products, and social links live in `data/storefront-config.json`, validated against `StorefrontConfigSchema` (Zod) on every save.

**Edit flow:**
1. Login at `/client-editor/login`
2. Edit fields at `/client-editor`
3. Click **Publish** → `publishStorefrontConfig` server action validates → writes JSON → revalidates ISR paths → redirects with `?published=1` banner

**What's editable:**
- Hero badge, headlines, subcopy, CTA labels
- Announcement bar text
- Brand accent color (hex)
- Featured product Shopify handles
- Homepage section headlines, body copy, CTA labels
- Social media URLs and fallback messaging

---

## Ad Gallery

18 ad mockup templates at `/editor/ads`, organized by category:

`brand` · `keychains-basic` · `keychains-standard` · `keychains-epic` · `earrings-dangle` · `earrings-heart` · `earrings-boho` · `earrings-charm` · `earrings-set` · `matching-set` · `event` · `seasonal`

Each mockup has: headline, subheadline, body copy, CTA, price, platform targets (Instagram/Facebook/TikTok), color scheme, and hashtags. Click **Copy Caption** to copy the full caption + hashtags to clipboard in one click.

Source: `data/ad-mockups.json`

---

## Shopify Integration

- **API**: Storefront GraphQL API (public reads — no token required)
- **Cart**: Shopify Storefront Cart API managed by `CartProvider` context
- **ISR**: Product pages pre-rendered at build; revalidated hourly
- **Mock sync**: `npm run shopify:sync` regenerates `src/lib/shopify/mocks.ts` with the live catalog
- **Image CDN**: `cdn.shopify.com` whitelisted in `next.config.mjs`

---

## Deployment

Every push to `main` auto-deploys to production via Vercel git integration.

```bash
git push origin main
# Vercel builds and deploys to lisascustomkeychains.com (~40s)
```

**Last clean build:**
- 62 routes generated
- TypeScript: 0 errors
- Build time: ~40s total

**Cron**: `/api/cron/generate-content` triggers daily at **14:00 UTC** via `vercel.json`. Requires `Authorization: Bearer <CRON_SECRET>` header.

---

## Pending Work

| Item | Notes |
|---|---|
| `/api/cron/generate-content` AI logic | Stub exists, gated, but no AI call implemented |
| Next.js middleware | Deferred — Turbopack/Vercel NFT incompatibility |
| Meta OAuth social feed | Auth routes exist; credentials not connected |
| Real pop-up event dates | `data/events.json` has seed data only |
| Shopify product title cleanup | Some titles are filename-based in Shopify Admin |
