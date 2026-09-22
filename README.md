# Bentota Smart Journeys — Smart Travel Booking & Route Management System

A Next.js website and admin panel for booking one-day and two-day tours from Bentota, Sri Lanka. Travelers choose a trip length, a route, and the destinations allowed on that route. Staff manage routes, destinations, packages, media and bookings from a secure admin panel, with real-time alerts for new bookings.

---

## 1. Technology

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | Public pages use ISR (5-minute revalidation) plus on-demand revalidation after admin edits |
| Backend | Next.js Route Handlers (`src/app/api`) | No separate Node.js server |
| Database | Firebase Firestore | Browser reads only (staff); all writes go through the API |
| Authentication | Firebase Authentication (email + password) | Roles stored as custom claims |
| Media | Cloudinary (images and videos) | Direct signed browser uploads, adaptive video streaming |
| Styling | Tailwind CSS 4 | Fonts: Bricolage Grotesque, Figtree (self-hosted via Fontsource) |
| Validation | Zod 4 | Shared by client and server |
| Bot protection | Cloudflare Turnstile (optional) | Booking form |
| Alerts | Firestore real-time listeners | Sound, desktop notification, badge and tab title |
| SMS | Stub, disabled | Future phase |
| Payments | Not included | Out of scope |

---

## 2. Pricing rules (defaults)

These follow common practice for Sri Lankan tour operators. Rates are set per route in the admin panel; age limits and booking notice are in **Website settings**.

| Rule | Default |
|---|---|
| Pricing model | Per person, fixed per route |
| Foreign nationals | US dollars (USD) |
| Sri Lankan nationals | Sri Lankan rupees (LKR) |
| How nationality is decided | Nationality field on the booking form (`LK` = local rate) |
| Adults | 12 years and over, adult rate |
| Children | 5–11 years, child rate (admin form suggests 50% of adult) |
| Infants | 0–4 years, free |
| Minimum travelers | 2 paying travelers (adults + children), editable per route |
| Maximum travelers | 15 including infants, editable per route |
| At least one adult | Required |
| Two-day accommodation | 1 night, twin/double sharing, half board |
| Single room | Single supplement charged per person needing a single room |
| Destinations chosen | Do not change the price |
| Entrance fees | Excluded by default (listed in exclusions) |
| Booking notice | At least 1 day ahead, up to 1 year ahead (Asia/Colombo time) |
| Price shown to traveler | Estimate only; the final price is confirmed by staff |
| Price calculation | Always recalculated on the server and stored as a snapshot on the booking |

---

## 3. Project structure

```
bsj/
├─ firestore.rules              Firestore security rules (deploy these)
├─ firebase.json                Firebase CLI config for rules/indexes
├─ scripts/
│  ├─ seed.ts                   Sample destinations, routes, packages
│  └─ set-admin.ts              Give a user the admin role
└─ src/
   ├─ app/
   │  ├─ (site)/                Public website
   │  │  ├─ page.tsx            Home
   │  │  ├─ tours/[tripType]    One-day and two-day tour listings
   │  │  ├─ packages/[slug]     Package details
   │  │  ├─ destinations/       Destination list and details
   │  │  ├─ gallery/            Gallery
   │  │  ├─ book/               Booking wizard and success page
   │  │  └─ privacy/            Privacy notice (template)
   │  ├─ admin/                 Admin panel (client-side, role protected)
   │  └─ api/
   │     ├─ bookings            Public booking submission
   │     ├─ admin/*             Staff APIs (token + role checked)
   │     └─ cloudinary/         Upload signing and webhook
   ├─ components/               UI, site, booking, media and admin components
   └─ lib/
      ├─ types.ts               Data model
      ├─ defaults.ts            Pricing and policy defaults
      ├─ pricing.ts             Price calculation and traveler rules
      ├─ validation.ts          Zod schemas
      ├─ cld-url.ts             Cloudinary delivery URLs
      ├─ firebase/              Client and Admin SDK setup
      └─ server/                Server-only helpers (auth, data, CRUD, notify, SMS stub)
```

### Firestore collections

| Collection | Purpose | Browser read access |
|---|---|---|
| `bookings` | Booking requests with route, destination, traveler and price snapshots | Admin, agent |
| `notifications` | Alert history (dashboard now, SMS later) | Admin, agent |
| `destinations` | Places that can be added to routes | All staff |
| `routes` | Ordered stops, selection limits, pickup points, per-person pricing | All staff |
| `packages` | Marketing groupings of routes with inclusions/exclusions | All staff |
| `media` | Cloudinary references (`publicId`, version, size, alt text, usage) | Admin, editor |
| `settings/site` | Business details, child policy, hero image, gallery | All staff |
| `auditLogs` | Record of every admin change | Admin |
| `counters/bookings` | Booking reference sequence (`BSJ-2026-0001`) | None |

No browser can write to Firestore directly.

---

## 4. Setup

### 4.1 Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20.9 or later (22 recommended) |
| Firebase project | Any plan for development |
| Cloudinary account | Free plan is enough to start |

```bash
npm install
cp .env.example .env.local
```

### 4.2 Firebase

| Step | Where | What to do |
|---|---|---|
| 1 | Firebase console | Create a project |
| 2 | Build → Firestore Database | Create database (production mode). A region close to Sri Lanka such as `asia-south1` is suitable |
| 3 | Build → Authentication → Sign-in method | Enable **Email/Password** |
| 4 | Project settings → General → Your apps | Add a **Web app** and copy the config into the `NEXT_PUBLIC_FIREBASE_*` variables |
| 5 | Project settings → Service accounts | **Generate new private key** and copy `project_id`, `client_email`, `private_key` into the `FIREBASE_ADMIN_*` variables |
| 6 | Firestore → Rules | Paste `firestore.rules` and publish, **or** run `npx firebase-tools deploy --only firestore:rules` |
| 7 | Authentication → Users | Add the first staff user (email + password) |

> Keep the private key in quotes in `.env.local` and leave the `\n` sequences as they are.

### 4.3 Cloudinary

| Step | Where | What to do |
|---|---|---|
| 1 | Settings → API Keys | Copy cloud name, API key and API secret into `.env.local` |
| 2 | Settings → Upload → Upload presets | Add a preset named `bsj_admin_signed` with the settings below |
| 3 | Settings → Security (optional, after launch) | Consider enabling strict transformations once the delivery transformations below are allowed |

**Upload preset `bsj_admin_signed`**

| Setting | Value |
|---|---|
| Signing mode | **Signed** (never use unsigned) |
| Folder / asset folder | `bsj/prod` (use `bsj/dev` in a development environment) |
| Use filename / unique filename | On / On |
| Overwrite | Off |
| Allowed formats | `jpg, jpeg, png, webp, avif, heic, mp4, mov, webm` |
| Incoming transformation | Leave empty (keeps video uploads fast) |

**Delivery transformations used by the site** (the code never generates others)

| Use | Transformation |
|---|---|
| Images | `c_limit,w_{480,960,1600},f_auto,q_auto` and `c_fill,g_auto,w_{480,960,1600},h_…,f_auto,q_auto` for 16:9, 4:3, 1:1, 3:4 |
| Video (MP4 fallback) | `c_limit,w_1280,q_auto,vc_auto` |
| Video (adaptive) | `sp_auto` → `.m3u8` |
| Video poster | `so_2,c_fill,w_{480,960,1600},h_…,q_auto` → `.jpg` |

**Adaptive video streaming.** After a video is uploaded, the server asks Cloudinary to prepare HLS renditions and calls `/api/cloudinary/webhook` when they are ready. This only works when `NEXT_PUBLIC_SITE_URL` is a public `https://` address. Until then, videos play as optimized MP4, so nothing breaks locally.

### 4.4 Cloudflare Turnstile (optional)

Create a Turnstile widget in the Cloudflare dashboard and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Leave both empty to disable the check in development.

### 4.5 First run

```bash
npm run set-admin -- owner@example.com   # give the first user the admin role
npm run seed                             # optional sample content
npm run dev
```

| URL | What |
|---|---|
| http://localhost:3000 | Public website |
| http://localhost:3000/admin | Admin panel |

Then, in the admin panel: upload images in **Media library**, attach them to destinations/routes/packages, set the hero image and WhatsApp number in **Website settings**, and replace the sample prices and descriptions.

---

## 5. Staff roles

| Role | Can do |
|---|---|
| Admin | Everything, including staff accounts and permanent media deletion |
| Content editor | Routes, destinations, packages, media library, website settings |
| Booking agent | Bookings and notifications |

Roles are Firebase custom claims. Changing a role or disabling an account from **Staff accounts** signs that person out everywhere.

---

## 6. How the main flows work

### 6.1 Booking

| Step | Where | What happens |
|---|---|---|
| 1 | Browser | Traveler chooses trip length → route → allowed destinations → travelers and pickup → review |
| 2 | Browser | Live price estimate in USD or LKR based on nationality |
| 3 | `POST /api/bookings` | Rate limit, Turnstile check, Zod validation |
| 4 | Server | Route must be active and match the trip length; destinations must belong to the route and be published; mandatory stops kept; selection limit respected |
| 5 | Server | Date rules (Asia/Colombo), traveler rules, price recalculated |
| 6 | Server | Reference `BSJ-YYYY-NNNN` generated in a transaction; booking saved with snapshots |
| 7 | Server | Dashboard notification written (SMS hook runs only if enabled) |
| 8 | Browser | Success page with reference and WhatsApp button |

### 6.2 Real-time booking alerts

The admin panel listens to Firestore for bookings with status `new`. When one arrives:

| Alert | Detail |
|---|---|
| Sound | Two-tone chime; four tones for foreign travelers. Mute button in the top bar |
| Pop-up | Card with a link to the booking (amber for priority) |
| Desktop notification | After staff choose **Turn on desktop alerts** |
| Badges | Sidebar count; pulsing amber when foreign bookings are waiting |
| Tab title | `(3) Admin …` |
| Dashboard | Priority list of new foreign bookings |

Alerts only appear while someone has the admin panel open. This is why SMS alerts are planned as the next phase.

### 6.3 Media

| Step | Detail |
|---|---|
| Upload | Browser → Cloudinary directly. The server only signs the request, and only for content roles. Files never pass through Next.js |
| Register | `POST /api/admin/media` reads the real metadata from Cloudinary (not from the browser) and stores it in Firestore |
| Use | Destinations, routes, packages and settings store the **media document ID**, never a URL |
| Track usage | `media.usedBy` is kept in sync on every save |
| Replace | Upload a new file; every page using that media updates; the old Cloudinary file is removed |
| Archive | Blocked while the file is in use |
| Delete | Admin only, archived and unused files only; removes the file from Cloudinary |
| Limits | 10 MB per image, 100 MB per video (Cloudinary Free plan limits) |

---

## 7. Adding SMS alerts later

| Step | File |
|---|---|
| 1. Choose a Sri Lankan SMS gateway and get API credentials | — |
| 2. Implement the gateway request in `sendSms()` | `src/lib/server/sms.ts` |
| 3. Set `SMS_ENABLED=true`, `SMS_API_URL`, `SMS_API_KEY`, `SMS_SENDER_ID` | `.env.local` / hosting |
| 4. Add admin mobile numbers | Admin → Website settings |

Delivery results are logged in **Notifications** automatically. No other code changes are needed.

---

## 8. Deployment

| Item | Recommendation |
|---|---|
| Hosting | Vercel (Pro plan for commercial use) or Firebase App Hosting (requires the Blaze plan) |
| Environment variables | Add every value from `.env.local`; set `NEXT_PUBLIC_SITE_URL` to the live `https://` domain |
| Firestore rules | Deploy `firestore.rules` before going live |
| Firebase Auth | Add the live domain under Authentication → Settings → Authorized domains |
| Cloudinary | Switch the preset folder to `bsj/prod` |
| Backups | Enable Firestore scheduled backups or point-in-time recovery (requires the Blaze plan) |

---

## 9. Security summary

| Area | Measure |
|---|---|
| Firestore | Browsers cannot write; reads limited by role |
| Admin APIs | Firebase ID token verified with revocation check; role checked per endpoint |
| Booking API | Server-side validation of every rule, server price calculation, rate limit, Turnstile |
| Cloudinary | Signed uploads only; preset enforced; folder, public ID, eager and notification parameters blocked; API secret server-only |
| Webhook | Cloudinary signature verified |
| Audit | Every admin change written to `auditLogs` |
| Headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| Privacy | Consent checkbox and privacy notice (Sri Lanka PDPA No. 9 of 2022); template text needs owner review |

---

## 10. Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run typecheck` | TypeScript check |
| `npm run seed` | Add sample content |
| `npm run set-admin -- email` | Give a user the admin role |

---

## 11. Known limitations and next steps

| Item | Note |
|---|---|
| Rate limiting | In-memory per server instance; Turnstile is the main bot defence. Use a shared store (e.g. Redis) if abuse appears |
| Bookings list | Loads the most recent 300 bookings with a **Load older bookings** button; add server-side search if volume grows large |
| Privacy notice | Template text; review with the business owner |
| Sample content | Seeded prices and descriptions are placeholders |
| Out of scope | Online payments, customer accounts, email notifications, multi-language, reviews |
| Next phase | SMS alerts to admin numbers |
