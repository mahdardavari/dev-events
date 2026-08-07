# Event Booking Platform

A modern, full-stack platform for discovering and booking developer events — hackathons, meetups, and conferences.

Built with **Next.js (App Router)**, **MongoDB**, **TypeScript**, and **Cloudinary**.

## Features

- **Authentication** — Sign up, sign in, logout, password reset (Better Auth + Gmail SMTP)
- **Browse Events** — List all events, view similar events by category
- **Event Booking** — Book your spot at any event (duplicate bookings rejected)
- **Create Event** — Signed-in users can create new events
- **Edit Event** — Event creators can edit their own events via the Edit button on the event page
- **Cloudinary Images** — Image upload and optimization
- **Search** — Debounced, URL-driven (`?q=`) search across title, description, location, and tags

## Tech Stack

| Concern     | Choice                                        |
| ----------- | --------------------------------------------- |
| Framework   | Next.js 16 (App Router, React 19, Turbopack)  |
| Database    | MongoDB with Mongoose ODM                     |
| Auth        | Better Auth (email/password)                  |
| Storage     | Cloudinary (images)                           |
| Forms       | react-hook-form + Zod (client) / Mongoose (server) |
| Styling     | Tailwind CSS + `tw-animate-css`               |
| Language    | TypeScript (strict)                           |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment variables

Create a `.env.local` with:

```bash
MONGODB_URI=            # MongoDB connection string
BETTER_AUTH_SECRET=     # secret for signing auth tokens
GMAIL_USER=             # sender address for password-reset emails
GMAIL_APP_PASSWORD=     # Gmail app password (not your account password)
NEXT_PUBLIC_BASE_URL=   # e.g. http://localhost:3000
```

## Project Structure

```
.
├── app/                          # Routes only — no business logic
│   ├── (auth)/                   #   Route group: sign-in / sign-up / password reset
│   │   ├── sign-in/
│   │   ├── sign-up-email/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── api/
│   │   ├── auth/[...all]/        #   Better Auth catch-all handler (do not touch)
│   │   └── events/               #   REST API for events (see “Code map”)
│   ├── create-event/             #   Create-event page + its server action inline
│   ├── edit-event/[slug]/        #   Edit-event page + its server action inline
│   ├── events/[slug]/            #   Event detail page (+ loading.tsx skeleton)
│   ├── page.tsx                  #   Home: hero + search + event feed
│   ├── layout.tsx                #   Root layout: fonts, navbar, LightRays bg
│   └── globals.css
├── components/
│   ├── ui/                       #   Generic, domain-agnostic primitives
│   │   ├── Navbar.tsx            #   Navigation
│   │   ├── SubmitButton.tsx      #   Pending-state button (useFormStatus) + variants
│   │   ├── AuthCard.tsx          #   Shared centered-card layout for auth pages
│   │   ├── FormAlert.tsx         #   Inline error/success alert for action state
│   │   └── LightRays.tsx         #   WebGL background effect (OGL) — see its header
│   ├── forms/                    #   Form primitives + the shared EventForm
│   │   ├── EventForm.tsx         #   Used by both create & edit pages
│   │   ├── FormField.tsx         #   Input/Textarea/Select wrappers (a11y-aware)
│   │   └── ImageUpload.tsx       #   Client-side image picker with preview
│   ├── events/                   #   Event-domain components
│   │   ├── SearchBar.tsx         #   Debounced search (client) — syncs URL ?q=
│   │   ├── SearchSection.tsx     #   Server component: reads ?q= and renders feed
│   │   ├── EventsList.tsx        #   Server component: fetches + renders EventCards
│   │   ├── EventCard.tsx         #   Card used in lists and “similar events”
│   │   ├── EventDetails.tsx      #   Full event page body (server, streamed)
│   │   └── BookEvent.tsx         #   Booking form (client) → booking action
│   └── auth/                     #   Auth-domain components
│       └── Profile.tsx           #   Signed-in greeting / sign-in links
├── lib/
│   ├── services/                 #   Shared business logic (the “service layer”)
│   │   └── event.service.ts      #   Event queries + create/update; called by BOTH
│   │                             #   server actions and the REST API routes
│   ├── actions/                  #   Server actions (only where a client
│   │   ├── auth.actions.ts       #   component must call them: auth forms,
│   │   └── booking.actions.ts    #   booking form) — dedupe by event+email
│   ├── models/                   #   Mongoose models (moved from database/)
│   │   ├── event.model.ts        #   Schema/model + slug/date/time hooks
│   │   └── booking.model.ts      #   Booking schema (duplicate-safe, event ref)
│   ├── validations/event.ts      #   Zod schema for the event form (client)
│   ├── event-form.ts             #   FormData → event object (parses agenda/tags)
│   ├── cloudinary.ts             #   uploadEventImage(file) → secure URL
│   ├── auth.ts                   #   Better Auth config (adapter + email plugin)
│   ├── session.ts                #   getSession() server helper
│   ├── mongodb.ts                #   Cached Mongoose connection (hot-reload safe)
│   ├── mongodb-client.ts         #   Cached native driver client (Better Auth)
│   └── utils.ts                  #   cn(), escapeRegex()
├── public/                       # Static assets (icons, images)
└── ...
```

## Code map

- **Pages fetch data directly from the service layer.** There is no client-side
  data layer: a page (server component) calls a function in `lib/services/`,
  which queries MongoDB and returns lean documents. The only `'use server'`
  actions (`lib/actions/`) are for functions a client component must invoke
  directly (auth forms, the booking form).
- **One service layer, every entry point calls it.** All event logic lives in
  `lib/services/event.service.ts` (a plain server-only module — no `'use server'`
  needed because nothing calls it from a client component):
  1. *Pages & server components* (`app/create-event`, `app/edit-event`,
     `components/events/*`) — they check the session and are the recommended
     path.
  2. *`app/api/events` REST routes* — for external consumers. They call the
     same service; only multipart parsing and HTTP status mapping differ.
     ⚠️ They still have weaker auth (see Tech debt).
- **`components/forms/EventForm.tsx`** is shared by create and edit. It sends
  `agenda`/`tags` as JSON strings inside FormData — `lib/event-form.ts` parses
  them back server-side.
- **Search flow:** `SearchBar` (client) pushes `?q=` → `SearchSection` /
  `EventsList` (server) re-query on the URL param. No client state to sync.
- **Streaming:** slow, optional sections of the event page (booking count,
  similar events) are wrapped in `<Suspense>` so they render as they resolve.

## Conventions

- **Lean documents for reads.** Queries use `.lean()` and are converted to the
  plain `IEventLean` shape (`_id` stringified) before crossing the server/client
  boundary.
- **Slug & normalization live in the model.** `event.model.ts` pre-save hook
  generates the slug from the title and normalizes `date`/`time`.
- **Mongoose enforces server-side rules** (required fields, enums, duplicate
  bookings); Zod is currently client-only. Keep both lists in sync.
- **Where logic lives:** pages, components, and API routes call
  `lib/services/` directly; services call `lib/models/`. `'use server'` actions
  in `lib/actions/` only wrap what a client component must call (auth, booking).
  Never put DB queries in a component or route.
- **Component naming:** PascalCase files; page-level component files sit next to
  their `page.tsx` under `components/` and are imported with the `@/` alias.

## Tech debt & roadmap

Known issues — tracked here so they don't get lost:

1. **`app/api/events/**` is missing real auth**: `POST` reads `createdBy` from
   form data and `PUT` trusts a spoofable `x-user-id` header. (The write logic
   is now shared via `lib/services/event.service.ts`; only the auth gap
   remains.) Fix or remove these routes before exposing them publicly.
2. **Zod schema is client-only.** `lib/validations/event.ts` should be run
   server-side too (in the actions) so validation rules can't drift.
3. **Duplicate title collisions** on the `slug` unique index surface as a raw
   500 — `createEvent` should catch `E11000` and return a friendly error.
4. **`SearchBar` skips its first keystroke** by design (hydration guard) — a
   single typed character with no follow-up won't search.

## Deployment

- [Vercel](https://vercel.com/) — Hosting
- [Cloudinary](https://cloudinary.com/) — Image storage
