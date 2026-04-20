# Citalab — Build Progress

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| ORM | Drizzle ORM |
| Database | Neon Postgres |
| Auth | Clerk (organizations enabled) |
| UI | Tailwind v4 + shadcn/ui |
| Email | Resend |
| Package manager | pnpm |

---

## Architecture

Multi-tenant: each lab is a Clerk Organization (`clerkOrgId` on `labs` table).

---

## Completed

### 1. Project setup
- Next.js 16 scaffolded with App Router, TypeScript, Tailwind v4
- shadcn/ui initialized
- Dependencies installed: `@clerk/nextjs`, `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `resend`, `lucide-react`, `date-fns`
- `package.json` scripts: `db:generate`, `db:migrate`, `db:push`, `db:studio`

### 2. Clerk integration
- `ClerkProvider` wrapping root layout (`src/app/layout.tsx`)
- Middleware at `src/middleware.ts` — public routes: `/`, `/sign-in`, `/sign-up`, `/:slug`, `/:slug/book`
- Auth redirects configured via `.env.local`

### 3. Database schema (`src/db/schema.ts`)
Four tables with Drizzle ORM:

#### `labs`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto-generated |
| `name` | text | |
| `slug` | text | unique, used for public URL |
| `address` | text | nullable |
| `phone` | text | nullable |
| `hours` | jsonb | `WeeklyHours` type — per-day open/close or null |
| `clerk_org_id` | text | unique, links to Clerk Organization |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

#### `services`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `lab_id` | uuid FK → labs | cascade delete |
| `name` | text | |
| `price` | numeric(10,2) | |
| `duration_minutes` | integer | default 15 |
| `requires_fasting` | boolean | default false |
| `instructions` | text | e.g. "8-hour fast required" |
| `active` | boolean | default true |

#### `appointments`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `lab_id` | uuid FK → labs | cascade delete |
| `patient_name` | text | |
| `patient_phone` | text | |
| `patient_email` | text | nullable |
| `appointment_date` | date | |
| `appointment_time` | time | |
| `status` | text | `pending` \| `completed` \| `no_show` \| `cancelled` |

#### `appointment_services`
| Column | Type | Notes |
|---|---|---|
| `appointment_id` | uuid FK → appointments | composite PK |
| `service_id` | uuid FK → services | composite PK |
| `price_snapshot` | numeric(10,2) | price locked at booking time |

- Migration file generated: `drizzle/0000_acoustic_toro.sql`
- DB connection at `src/db/index.ts` (Neon HTTP driver)

---

## Completed (continued)

### 4. Auth pages
- `src/app/sign-in/[[...sign-in]]/page.tsx` — Clerk `<SignIn />` hosted UI
- `src/app/sign-up/[[...sign-up]]/page.tsx` — Clerk `<SignUp />` hosted UI

### 5. Onboarding wizard (`/onboarding`)

**Guards (server component `page.tsx`):**
- No `orgId` → renders Clerk `<CreateOrganization afterCreateOrganizationUrl="/onboarding" />`
- Lab already exists for org → redirects to `/dashboard`

**Step 1 — Lab info (`step-info.tsx`):**
- Name (required), Address (textarea, optional), Phone (optional)

**Step 2 — Hours (`step-hours.tsx`):**
- Mon–Fri shared open/close selects (default 8:00 AM – 7:00 PM)
- "También sábados" checkbox → reveals Saturday time picker (default 8:00 AM – 2:00 PM)
- "También domingos" checkbox → reveals Sunday time picker (default 9:00 AM – 1:00 PM)
- Stored as `WeeklyHours` JSON; null for disabled days

**Step 3 — Catalog (`step-catalog.tsx`):**
- Import button → pre-loads 20 common Mexican clinical studies
- Manual form: name, price (MXN), duration (10/15/20/30 min), fasting checkbox + instructions
- Scrollable service list with per-item remove button
- Requires ≥ 1 service to proceed

**Server action (`actions.ts`):**
- Reads `orgId` from Clerk `auth()`
- Generates kebab-case slug from lab name (strips accents, handles duplicates with `-2`, `-3` suffix)
- Inserts `labs` row, then bulk-inserts `services` rows
- Redirects to `/dashboard`

---

### 6. Middleware hardening
- `/:slug` pattern was matching reserved routes (`/dashboard`, `/onboarding`). Replaced with a reserved-segment guard (`src/middleware.ts`): public if URL starts with a non-reserved segment.

### 7. Public lab landing (`/[slug]`)
- Server component — fetches `labs` by slug (404 if not found) + active `services` (alphabetical).
- Sections: header (name, address with map icon, clickable phone), hero with CTA to `/agendar`, hours table (groups Mon–Fri if identical, else lists each day), services list with fasting badges, bottom CTA.
- `services-list.tsx` client: "Ver catálogo completo" expands past first 10.
- Design: sky-blue medical palette, gradient hero, rounded cards, MXN formatting.

### 8. Booking wizard (`/[slug]/agendar`)
- Server page fetches: lab, active services, non-cancelled appointments from today onward (for slot blocking).
- **Step 1 — services** (`step-services.tsx`): search filter (accent-insensitive), checkbox list with fasting badge, sticky bottom bar with total MXN + selection count + Continuar disabled until ≥ 1 service.
- **Step 2 — datetime + patient** (`step-datetime.tsx`):
  - Selected-services summary card with total.
  - Calendar (`react-day-picker` via shadcn Calendar, Spanish locale) — disables past days + closed days (per `WeeklyHours`).
  - Slots grid: 30-min intervals within the day's hours, strike-through for past/taken slots.
  - Patient form: `react-hook-form` + `zod` (name ≥ 2 chars, 10-digit MX phone regex, optional email).

### 9. Server action — `createAppointment` (`/[slug]/agendar/actions.ts`)
- Validates: lab exists, service IDs all belong to lab and are active.
- Race-condition guard: rejects if another non-cancelled appointment exists at same `(labId, date, time)` → client shows "ese horario acaba de ocuparse".
- Inserts `appointments` (status `pending`) + bulk-inserts `appointment_services` with `priceSnapshot` locked to current service price.

### 10. Confirmation page (`/[slug]/confirmacion/[id]`)
- Server component — verifies appointment belongs to the slug's lab (404 otherwise).
- Shows: success icon, localized date + 12h time, itemized services + total, patient info, amber alert listing fasting instructions per study, lab contact, back-to-landing link.

### 11. Utilities (`src/lib/hours.ts`)
- `WeeklyHours` helpers: `DAY_LABELS_ES`, `formatTime12h`, `groupHoursForDisplay` (Mon–Fri grouping), `dateToDayKey`, `isDayOpen`, `generateSlots` (30-min slots with past/taken exclusion), `formatDateYMD`, `parseYMD`, `normalizeTimeString`.

---

## Dependency notes
- **zod downgraded to v3** — `@hookform/resolvers@5` ships typings targeting `zod/v3` and `zod/v4/core`; a stock `import { z } from "zod"` v4 schema doesn't satisfy either.
- **Button has no `asChild`** in this project's shadcn config (base-ui Button, not radix). For link-styled buttons use `buttonVariants(...)` as `className` on `<Link>`.

---

## Pending

- [ ] Admin dashboard `/dashboard` (today's appointments, services CRUD, lab settings)
- [ ] Email confirmations via Resend
- [ ] WhatsApp reminders

---

## Key file map

```
src/
├── app/
│   └── layout.tsx          # ClerkProvider root
├── db/
│   ├── index.ts            # Drizzle + Neon connection
│   └── schema.ts           # 4-table schema + TypeScript types
├── middleware.ts            # Clerk auth + public route matcher
drizzle/
│   └── 0000_acoustic_toro.sql  # Initial migration
drizzle.config.ts
.env.local                  # Keys (not committed)
```
