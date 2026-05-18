# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo is a two-package monorepo (no root `package.json` / workspaces — each package is installed and run independently):

- `VoluntariadoUPB/` — React Native + Expo mobile app (the actual product).
- `gemini-backend/` — NestJS service that proxies Google Gemini for the in-app chat assistant and verifies Supabase JWTs.
- `FIREBASE_FUNCTIONS_NOTIFICATIONS.ts` (root) — standalone reference snippet for a Firebase Cloud Function that would fan out Expo push notifications. It is **not** wired into either package; treat it as documentation, not active code.

> Note: The README still talks about Firebase Auth/Firestore. The codebase has been migrated to **Supabase** (Postgres + GoTrue) + **Cloudinary** (images) + an external **NestJS Gemini backend**. Trust the code over the README when they disagree.

## Common commands

### Frontend — `VoluntariadoUPB/`

```bash
cd VoluntariadoUPB
npm install
npm run start         # Expo dev server (QR code for Expo Go)
npm run android       # Build/run on Android emulator or device
npm run ios           # Build/run on iOS simulator
npm run web           # Web build on port 4000
```

There is no lint or test script configured for the Expo app. TypeScript is strict (`tsconfig.json` extends `expo/tsconfig.base` with `strict: true`); type-check with `npx tsc --noEmit` from `VoluntariadoUPB/`.

### Backend — `gemini-backend/`

```bash
cd gemini-backend
npm install
npm run start:dev     # NestJS in watch mode on http://localhost:3000
npm run build         # nest build -> dist/
npm run start:prod    # node dist/main
npm run lint          # eslint --fix on src/, apps/, libs/, test/
npm test              # Jest unit tests
npm run test:e2e      # End-to-end tests via test/jest-e2e.json
npm run test:watch
npm run test:cov
```

Run a single backend test: `npx jest path/to/file.spec.ts` (or `-t "test name"`).

### Database seeding

Auth users **must** be created through Supabase GoTrue, not raw SQL. From `gemini-backend/`:

```bash
npx ts-node seed.ts   # Creates the three fixed-UUID auth users + public.users rows
```

`gemini-backend/seed.sql` is a manual reference and assumes those auth users already exist.

## Architecture

### Frontend (`VoluntariadoUPB/`)

**Routing** — Expo Router (file-based). `app/_layout.tsx` is the root `<Stack>`. Route groups:

- `app/(auth)/` — login / register, shown when there is no session.
- `app/(drawer)/` — main authenticated shell with a Drawer.
  - `(drawer)/(tabs)/` — bottom-tab UI with nested stacks: `opportunities/`, `applications/`, `map/`, `profile/`. Dynamic detail screens use `[id].tsx`.
  - `(drawer)/(admin)/` — admin-only screens (e.g. `gestion-ubicaciones.tsx`).
  - Top-level drawer pages: `about.tsx`, `settings.tsx`, `chat.tsx` (Gemini assistant), `notification-test.tsx`.
- `app/onboarding.tsx`, `app/index.tsx` — first-run flow / entry redirect.

The root layout subscribes to `supabase.auth.onAuthStateChange` and pushes the user into `useAuthStore`. Navigation between `(auth)` and `(drawer)` is driven by the presence of `user` in that store, not by manual `router.replace` calls inside screens.

**State** — Zustand stores in `src/store/`:
- `useAuthStore` — Supabase user + auth actions (`signUp`, `signIn`, `signInWithGoogle`, `logout`). Auth errors are mapped to user-facing Spanish strings inside the store via `mapAuthError`; do not re-map at the call site.
- `useOportunidadesStore` — list of opportunities + filter object (`campus`, `categoria`, `modalidad`, `busqueda`, `status`, etc.).
- `useThemeStore` — light/dark mode.

**Data layer** — `config/supabase.ts` creates a single Supabase client using `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`, with `AsyncStorage` as the session store. Only the **anon key** belongs in the frontend — the service-role key is backend-only.

Feature hooks in `src/hooks/<feature>/` (`oportunidades`, `postulaciones`, `profile`, `auth`, `notifications`, `location`, `storage`, `ui`) own all Supabase reads/writes for their domain. Components consume hooks; components do not call `supabase` directly.

**Types** — Domain types live in `src/types/index.ts` (`Oportunidad`, `Postulacion`, `User`, `Ubicacion`, plus the string-literal unions `CategoriaType`, `ModalidadType`, `OportunidadStatusType`, `PostulacionEstadoType`, `UserRoleType`, `DisponibilidadType`). Spanish field names (`titulo`, `descripcion`, `cupos`, `estado`, …) are intentional and match the Postgres schema — do not "translate" them.

Per the comment in `src/index.ts`, the `src` barrel exports stores/hooks/components but **not** types — types must be imported directly from `src/types` to avoid a name clash between the DB-shaped `Postulacion` (in `types`) and the UI-shaped `Postulacion` re-exported via the hooks barrel.

**Images** — Cloudinary, configured in `config/cloudinary.ts`. Use `getCloudinaryUrl(publicId, transformation)` rather than hand-building URLs; the transformation presets (`avatar`, `cover`, `oportunidad`, …) match how images are uploaded via `CloudinaryImagePicker`.

**Notifications** — `expo-notifications` only (local notifications + listeners). The foreground notification handler is set once in `app/_layout.tsx`. Background scheduling lives in `src/services/notificationScheduler.ts`. No remote push pipeline is currently wired up in the app — `FIREBASE_FUNCTIONS_NOTIFICATIONS.ts` at the repo root is a reference implementation, not deployed code.

**Gemini chat** — `src/features/chat/` calls the NestJS backend at `expo-constants` → `extra.GEMINI_BASE_URL` (defaulting to `http://localhost:3000` per `app.json`). All requests must send `Authorization: Bearer <supabase access_token>`; the backend's `AuthGuard` validates it via `supabase.auth.getUser(token)`.

### Backend (`gemini-backend/`)

NestJS 11. `src/main.ts` boots with:
- Global prefix `/api`.
- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` — DTOs must declare every accepted field, and unknown fields are rejected.
- CORS restricted by the `CORS_ORIGINS` env var (comma-separated). When unset, only localhost dev origins are allowed — **never** call `app.enableCors()` with no args, as that allows all origins.
- Global `ThrottlerGuard` at 20 req/min/IP (configured in `app.module.ts`).

Modules:
- `SupabaseModule` / `SupabaseService` — server-side Supabase client using `SUPABASE_SERVICE_ROLE_KEY`. Service-role privileges; never expose to the frontend.
- `AuthGuard` (`src/auth/auth.guard.ts`) — applied via `@UseGuards(AuthGuard)` on controllers (e.g. `GeminiController`). Reads `Authorization: Bearer …`, verifies through Supabase, and attaches `request.user`.
- `GeminiModule` — `gemini.controller.ts` exposes streaming/chat/image endpoints; `gemini.service.ts` plus `use-cases/`, `repositories/`, `helpers/`, `dtos/` follow a use-case-per-endpoint structure. Chat history is persisted to Supabase inside `chatStream` after the stream finishes.
- `HealthController` — `/api` healthcheck.

Env validation lives in `src/config/env.validation.ts` (class-validator). Required: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Optional: `API_URL`, `CORS_ORIGINS`, `PORT` (default 3000). The app will fail to boot if a required var is missing.

## Environment configuration

### `VoluntariadoUPB/.env`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDINARY_*` (see `.env.example`)

`EXPO_PUBLIC_` prefix is required for Expo to bundle the value into the JS — without it the variable will be `undefined` at runtime.

`GEMINI_BASE_URL` is set via `expo.extra` in `app.json`, not `.env`. Read it with `expo-constants`.

### `gemini-backend/.env`
- `GEMINI_API_KEY`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGINS` (set in production)
- `PORT` (optional)

## Conventions

- Spanish identifiers in domain code (`oportunidad`, `postulacion`, `cupos`, `motivacion`) mirror the Postgres schema. Keep them.
- Auth/data access flows top-down: **screen → feature hook → Supabase client**. Adding a `supabase.from(...)` call inside a screen or generic component is an architectural smell — push it into a hook under `src/hooks/<feature>/`.
- Backend controllers use `@UseGuards(AuthGuard)` for any route the mobile app calls. Anonymous endpoints (only `HealthController` today) explicitly omit it.
- New ImageType uploads should go through `getCloudinaryUrl` + the existing `CLOUDINARY_FOLDERS` enum so transformations stay consistent.
