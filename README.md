# Veriq

**Check that a product is real, in seconds.**

## Overview

Veriq is a web application that helps manufacturers protect their products from copies. A manufacturer puts a unique code on every product. A customer types the code or scans its QR code, and Veriq says right away whether the product is genuine.

There are three kinds of people on the platform:

- **Manufacturers** register their company, create codes for their products and put them on the packaging.
- **Customers** check a code on any phone, with no account and no app, and see the result in their own language.
- **The admin** (the platform owner) reviews every company and decides who can use Veriq.

Every check ends in one of three clear results:

| Result | What it means |
|---|---|
| **Genuine** | The manufacturer registered this code, and nobody has checked it before. |
| **Checked before** | The code has been checked already. It may have been copied onto a fake product, so be careful. |
| **Not recognised** | There is no record of this code. |

A genuine result also shows the manufacturer's name and logo, and the product details.

## Problem

Fake products are a real problem for everyone involved:

- **Customers** can't easily tell a genuine product from a copy. For things like medicine, food, cosmetics and spare parts, a fake can be dangerous.
- **Honest manufacturers** lose sales and trust to people who copy their products.
- **The tools that exist** are often big, costly or complicated, and they rarely speak the languages people use every day.

Veriq keeps the answer simple. One code, one check, one clear result, in English, French, Yoruba, Hausa or Igbo.

## Features

**For manufacturers**
- Sign up and apply with business details, a logo and verification documents.
- Create codes for a product, up to 1,000 at a time, as text codes or QR codes.
- See how many codes were created, used, unused and copied.
- Search and filter codes, and mark a code as copied. Copying never stops a code from working.
- Share a verification link, or paste a ready-made checker into their own website.

**For customers**
- Check a product without making an account.
- Type a code, or scan a QR code with the phone camera.
- See the manufacturer's name, logo and the product details.
- Read the result in English, French, Yoruba, Hausa or Igbo.
- Get a clear warning when a code has been checked before.

**For the admin**
- Review each application with its business details, logo and documents.
- Approve a company, or reject it with a reason the company can read and then apply again.

**Account features**
- Sign up, log in, log out and reset a forgotten password.
- Pages that change depending on who is logged in.

**Built-in protection**
- Only approved companies can create codes.
- Company documents are private and only the admin can open them.
- Passwords are handled by Firebase. Veriq never sees them.
- Repeated wrong guesses are blocked, so nobody can guess their way to a valid code.
- Veriq does not record who checked a code.

**Planned**
- Emails to companies when they are approved or rejected.
- Pages and search for very long lists of codes, and bulk QR download for printers.
- Editing company details and the logo.

## Technologies

| Part | Tool | What it does |
|---|---|---|
| Website | Next.js 16, React, TypeScript | The pages and the server logic |
| Design | Tailwind CSS | Styling |
| Motion and icons | Framer Motion, Lucide | Animations and icons |
| Accounts | Firebase Authentication | Sign up, log in, password reset |
| Database | Firebase Firestore | Companies, codes, files and results |
| QR codes | `qrcode` | Turns each code into a QR image |
| Photos | Unsplash | Photos on the landing page |
| Hosting | Vercel | Puts the site online |

## Screenshots

> Add your screenshots to `docs/screenshots/` using the file names below. Before you take them, hide any private information, such as real email addresses, documents and keys.

**Landing page**

![Landing page](docs/screenshots/landing-page.png)

**Customer verification: a genuine result**

![Genuine result](docs/screenshots/verify-genuine.png)

**Customer verification: a result in Yoruba**

![Result in Yoruba](docs/screenshots/verify-yoruba.png)

**Company application (onboarding)**

![Company application](docs/screenshots/onboarding.png)

**Admin: reviewing an application**

![Admin review](docs/screenshots/admin-review.png)

**Manufacturer dashboard: overview**

![Dashboard overview](docs/screenshots/dashboard-overview.png)

**Manufacturer dashboard: generating codes**

![Generate codes](docs/screenshots/generate-codes.png)

**Manufacturer dashboard: codes list**

![Codes list](docs/screenshots/codes-list.png)

**Settings: share link and website checker**

![Settings](docs/screenshots/settings-embed.png)

## Live demo

**Live site:** https://YOUR-SITE.vercel.app *(replace with your link)*

**Source code:** https://github.com/abdulmalik-codeWithFaith/Veriq

On the home page, the "Try a verification" box uses sample codes. Try `VR8K29PX` (genuine), `AB7M42QX` (checked before) or any other code (not recognised). Real codes come from a manufacturer's dashboard.

## Installation

You need **Node.js 20.6 or newer**, **Git**, and a free **Firebase** account.

**1. Get the code and install it**
```bash
git clone https://github.com/abdulmalik-codeWithFaith/Veriq.git
cd Veriq
npm install
```

**2. Set up Firebase**
1. Create a project in the Firebase console.
2. Under **Authentication**, turn on the **Email/Password** sign-in method.
3. Create a **Firestore Database** in production mode. In its **Rules** tab, paste the contents of `firestore.rules` and publish. These rules keep all data private, because the site reads and writes data only through its own server.
4. Under **Project settings, Your apps**, register a web app and copy its settings.
5. Under **Project settings, Service accounts**, click *Generate new private key*.

**3. Add your keys**

Copy `.env.local.example` to `.env.local` and fill in the seven values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

- The four `NEXT_PUBLIC_` values come from the web app settings.
- The other three come from the downloaded key file (`project_id`, `client_email`, `private_key`). Keep the quotation marks and the `\n` parts.
- **Never commit `.env.local` or the key file to GitHub.**

**4. Start it**
```bash
npm run dev
```
Open http://localhost:3000.

**5. Make yourself the admin**

Sign up on the site with your own email, then run:
```bash
node --env-file=.env.local scripts/set-admin.mjs you@email.com
```
Log in again and you will land on the admin page.

**6. Try the whole flow**
1. Sign up with a second email and send the business form.
2. Log in as admin and approve it.
3. Log in as the company, create some codes, then check one on your phone at `/verify`.

### Putting it online (Vercel)

1. Add the same seven values in Vercel under **Settings, Environment Variables** and redeploy. For `FIREBASE_PRIVATE_KEY`, paste the value without the surrounding quotation marks.
2. In Firebase, add your site's address under **Authentication, Settings, Authorized domains**.
3. In Firebase, open **Firestore, TTL** and add a policy for the collection `rateLimits` on the field `expireAt`. This clears the small guess-protection records after about a day.
4. Open `app/legal.tsx` and fill in your name, email and address for the terms and privacy pages. Put your support email in `app/rejected/page.tsx`.

> The terms and privacy pages are plain-language drafts, **not legal advice**. Have a lawyer review them before real customers use the product.

## Architecture

Veriq is one Next.js application. The browser shows the pages, and all the important work happens on the server.

```mermaid
flowchart LR
  C["Customer<br/>(phone or browser)"] --> W
  M["Manufacturer"] --> W
  A["Admin"] --> W
  W["Veriq website and server<br/>(Next.js on Vercel)"] --> F[("Firestore<br/>database")]
  W --> U["Firebase<br/>Authentication"]
```

### The main idea

**The browser never touches the database.** Firestore's rules block all direct access. Every read and write goes through Veriq's own server code, which first checks who is asking. This is what keeps codes, documents and counts safe from tampering.

### How a person gets in

1. The person signs in with Firebase Authentication.
2. The server checks that sign-in and gives the browser a secure cookie. The cookie can't be read by scripts on the page.
3. Every protected page checks the cookie on the server before showing anything:
   - `/admin` is open only to the admin.
   - `/dashboard` is open only to companies that have been approved.
   - A company that has not finished its application, is waiting, or was rejected is sent to the page that matches its status.

### How a company becomes approved

```
signup -> onboarding form -> pending -> admin approves -> dashboard
                                    \-> admin rejects with a reason -> apply again
```

The application, logo and documents are checked on the server. The server looks at the real contents of each file, not just its name. Files are saved in Firestore, split into small pieces because one database record is limited in size, so no paid storage service is needed. Only the admin can open them.

### How codes are made and checked

- **Creating codes:** The server makes each code from 8 random characters. The alphabet leaves out look-alike characters (0, O, 1, I, L), which gives about 850 billion possible codes. Each code is saved under its company, with a short lookup entry so a check can find its owner quickly.
- **Checking a code:** The customer's browser sends the code to the server. The server:
  1. checks the code's format,
  2. checks the visitor has not made too many wrong guesses,
  3. finds the code and adds one to its check count,
  4. replies **genuine** if it was the first check, **checked before** if not, or **not recognised** if the code doesn't exist.
- **Guessing protection:** A visitor who tries 10 well-formed but unknown codes within 10 minutes is blocked for the rest of that window. Only a scrambled fingerprint of the visitor is kept, never their address.
- **Three separate states:** A code can be created, copied and checked. These are tracked apart, so copying a code never makes it look used.

### What is stored

| Place in Firestore | What it holds |
|---|---|
| `companies/{id}` | Business details, status, and the reason if rejected |
| `companies/{id}/files` | The logo and documents, in small pieces |
| `companies/{id}/codes` | Each code, its product, whether it was copied, and its check count and times |
| `codeIndex/{code}` | A lookup from a code to its company |
| `rateLimits/{key}` | Wrong-guess counts, deleted automatically after about a day |

### Other pieces

- **Languages:** All the customer-facing texts live in `app/verify/translations.ts`, in English, French, Yoruba, Hausa and Igbo. The Yoruba, Hausa and Igbo texts should be reviewed by native speakers before launch.
- **Website checker:** Companies can paste a small piece of code into their site. It shows the same checker inside a frame, loaded from `/embed/verify`.
- **QR codes:** Each QR code holds a link to `/verify?code=...`, so scanning it opens the page and checks the code at once.

### Project layout

```
app/
  page.tsx                          landing page
  signup, login, forgot-password    accounts
  onboarding, pending, rejected     the company application
  admin/                            review, approve and reject
  dashboard/                        overview, codes, generate, settings
  verify/                           the customer check and its translations
  embed/verify/                     the checker companies place on their sites
  terms, privacy                    legal pages
  api/                              server routes (sign-in session, onboarding, verify, files)
lib/                                Firebase, sign-in and code logic (server side)
scripts/set-admin.mjs               makes an account the admin
firestore.rules                     the database rules (everything blocked from the browser)
docs/screenshots/                   screenshots for this README
```