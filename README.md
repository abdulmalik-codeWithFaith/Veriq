# Veriq

Veriq lets manufacturers give every product a unique code, so customers can check in seconds that a product is genuine.

A company registers and is reviewed by the platform admin. Once approved, it creates codes (text or QR) for its products. A customer enters or scans a code on the verification page and sees whether it is genuine, unrecognised, or has been checked before.

## Status

| Area | State |
|---|---|
| Landing page, signup, login | Done, real Firebase auth |
| Business onboarding with documents and logo | Done, saves to Firestore |
| Admin review, approve and reject | Done, real data |
| Pending and rejected pages | Done, real status |
| Manufacturer dashboard (overview, codes, generate, settings) | Screens done, **still sample data** |
| Customer verification page (5 languages) | Screen done, **still sample data** |
| Emails (approved / rejected) | Not built |
| Log out, forgot password, terms, privacy | Not built |

The product is not ready to launch until code generation and verification run on the server. See [What is left](#what-is-left).

## Tech stack

- Next.js 16 (App Router, Turbopack, Cache Components) and TypeScript
- Tailwind CSS v4, lucide-react, Framer Motion
- Firebase: Authentication (email and password) and Firestore. No paid services needed.
- Firebase Admin SDK on the server only
- `qrcode` for QR codes

## Getting started

You need Node.js 20.6 or newer.

```bash
npm install
npm i firebase firebase-admin server-only framer-motion lucide-react qrcode
npm i -D @types/qrcode tailwindcss @tailwindcss/postcss postcss
```

Copy `.env.local.example` to `.env.local` and fill it in (see below), then:

```bash
npm run dev
```

Open http://localhost:3000.

### Firebase setup

1. Create a project in the Firebase console.
2. **Authentication**: turn on the Email/Password sign-in method.
3. **Firestore Database**: create it in production mode. Choose the region closest to your customers (it cannot be changed later). Open the Rules tab, paste the contents of `firestore.rules`, and publish. These rules block all direct access from browsers. The server uses the Admin SDK, which ignores them.
4. **Project settings, Your apps**: add a Web app and copy its config values.
5. **Project settings, Service accounts**: click *Generate new private key*.

### Environment variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

- The four `NEXT_PUBLIC_` values come from the web app config.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` come from the service account JSON (`project_id`, `client_email`, `private_key`). Keep the quotes and the `\n` characters.
- **Never commit `.env.local` or the service account JSON.** Anyone with them has full access to your Firebase project.
- Add the same variables in Vercel under Settings, Environment Variables.

### Create the admin

1. Create the account: sign up on `/signup` with your admin email, or add the user in Firebase Authentication.
2. Run:

```bash
node --env-file=.env.local scripts/set-admin.mjs you@email.com
```

3. Log in again at `/login`. You are taken to `/admin`.

## How it works

### Account flow

```
signup -> /onboarding -> submit -> /pending -> admin decides
                                      |-> approved -> /dashboard
                                      |-> rejected -> /rejected -> apply again
```

- Signing up creates a Firebase user and a `companies/{uid}` record with status `incomplete`.
- Logging in turns the Firebase sign-in into a secure, HTTP-only session cookie (`/api/session`). The server then sends each person where they belong.
- The admin is a Firebase user with the custom claim `admin: true`.
- `/admin/*` is only open to the admin. `/dashboard/*` is only open to approved companies. These checks run on the server (`lib/auth/session.ts`).

### Data and security

The browser never reads or writes Firestore. All data goes through server code (route handlers and server actions) using the Admin SDK.

`companies/{uid}` fields: `ownerName`, `email`, `businessName`, `address`, `businessEmail`, `phone`, `website`, `category`, `slug`, `logoPath`, `documents[]`, `status` (`incomplete`, `pending`, `approved`, `rejected`), `submittedAt`, `rejectionReason`, `reviewedAt`, `reviewedBy`.

Logos and documents are stored in Firestore, in `companies/{uid}/files/{fileId}`. Big files are split into chunks of 800 KB, because a Firestore document holds at most 1 MiB. Only the admin can open them, through `/api/admin/files/...`.

### Code states (important)

Each code tracks three separate things:

- it exists (generated)
- `copied`: the company copied it. This is only a flag and never blocks verification.
- `verifiedCount`: how many times a customer verified it

Copying a code never counts as a customer using it.

## Project structure

```
app/
  layout.tsx, page.tsx, globals.css       site shell and landing page
  signup/  login/                         account pages
  onboarding/  pending/  rejected/        company application flow
  admin/                                  application list, review, approve/reject
  dashboard/                              overview, codes, generate, settings
  verify/                                 customer verification page + translations
  embed/verify/                           widget companies embed on their sites
  api/session/  api/onboarding/           route handlers
lib/
  firebase/client.ts                      browser Firebase (sign in only)
  firebase/admin.ts                       server Firebase (Auth, Firestore)
  auth/session.ts                         session cookie and access checks
  companies.ts                            company data helpers
  categories.ts                           product categories
scripts/set-admin.mjs                     makes an account the admin
firestore.rules                           reference copy of the Firestore rules
```

## Notes

- **Upload limit:** onboarding files total 4 MB at most, because Vercel rejects larger requests. Photos are shrunk in the browser automatically. PDFs are not.
- **Cache Components:** any page that reads cookies, `params` or `searchParams` must keep that read inside a `<Suspense>` boundary, or the build fails.
- **Path alias:** imports use `@/`. This needs `"paths": { "@/*": ["./*"] }` in `tsconfig.json` (the default).
- **Embed widget:** the widget is an iframe of `/embed/verify`. If you add security headers that block iframes, make an exception for `/embed/*`.
- **Translations:** the Yoruba, Hausa and Igbo texts in `app/verify/translations.ts` must be reviewed by native speakers before launch.

## What is left

1. **Real code generation:** create unique codes on the server and save them in Firestore. Wire the codes list, overview counts and the copied flag.
2. **Real verification:** look up the code, record every check, flag repeated checks, limit guessing attempts, and show the real manufacturer, logo and product.
3. **Emails:** tell companies when they are approved or rejected (look for the `TODO` comments in `app/admin/actions.ts`).
4. **Missing pages:** log out button, forgot password, terms of use, privacy policy.
5. **Deployment:** environment variables in Vercel, real domain for share links and the embed code, real support email in `app/rejected/page.tsx`.
6. **Later:** editing company details and logo, bulk QR export, uploads over 4 MB, email confirmation at signup.