# Veriq

**Check that a product is real, in seconds.**

Veriq lets manufacturers put a unique code on every product. A customer types the code or scans its QR code, and Veriq says right away whether the product is genuine.

Live site: https://YOUR-SITE.vercel.app *(replace with your link)*

---

## The problem

Fake products are a real problem for everyone involved:

- **Customers** can't easily tell a genuine product from a copy. For things like medicine, food, cosmetics and spare parts, a fake can be dangerous.
- **Honest manufacturers** lose sales and trust to people who copy their products.
- **The tools that exist** are often big, expensive or complicated, and rarely speak the languages people use every day.

## The solution

Veriq keeps it simple. Every product gets its own code, and a customer can check it in three steps:

1. Enter the code, or scan the QR code with a phone camera.
2. Tap **Verify**.
3. Read the result.

| Result | What it means |
|---|---|
| **Genuine** | The manufacturer registered this code, and nobody has checked it before. |
| **Checked before** | This code has already been checked. It may have been copied onto a fake product, so be careful. |
| **Not recognised** | There is no record of this code. |

A genuine result also shows the **manufacturer's name and logo** and the **product details**, so the customer knows exactly what they are looking at.

## Who it is for

- **Manufacturers** who want to protect their products and their name.
- **Customers** who want to know what they are buying.
- **The platform owner (admin)**, who checks every company before it can use Veriq.

## What it can do

**For manufacturers**
- Sign up and apply with business details, a logo and documents.
- Create codes for a product, up to 1,000 at a time, as text codes or QR codes.
- See how many codes were created, used, unused and copied.
- Mark codes as copied. This never stops a code from working.
- Share a verification link, or paste a ready-made checker into their own website.

**For customers**
- Check a product without making an account.
- See the result in **English, French, Yoruba, Hausa or Igbo**.
- Get a clear warning when a code looks suspicious.

**For the admin**
- Review each application, with the business details and uploaded documents.
- Approve a company, or reject it with a reason the company can read.

**Built-in protection**
- Only approved companies can create codes.
- Company documents are private and can only be opened by the admin.
- Passwords are never seen or stored by Veriq.
- Repeated wrong guesses are blocked, so nobody can guess their way to a valid code.
- Veriq does not record who checked a code.

## How it works

```
Company signs up -> sends business details -> admin reviews
        -> approved -> company creates codes -> codes go on products
        -> customer checks a code -> genuine / checked before / not recognised
```

One idea runs through the whole product: **copying a code is not the same as using it.** A code can be created, copied, and checked as three separate things, so a manufacturer copying codes to print them never makes them look used.

## Built with

| Part | Tool | What it does |
|---|---|---|
| Website | Next.js, React, TypeScript | The pages and the logic behind them |
| Look and feel | Tailwind CSS, Lucide icons, Framer Motion | Design, icons and small animations |
| Accounts | Firebase Authentication | Sign up, log in, reset passwords |
| Database | Firebase Firestore | Companies, codes and results |
| QR codes | `qrcode` | Turns each code into a QR image |
| Hosting | Vercel | Puts the site online |

## Status

Everything below has been built and tested:

- Landing page, sign up, log in, forgot password, log out
- Company application with logo and documents
- Admin review, approve and reject
- Manufacturer dashboard: overview, codes, generate, settings
- Customer verification page and the embeddable checker
- Five languages
- Terms of use and privacy policy pages (drafts, see below)

**Still to do**
- Emails to companies when they are approved or rejected
- Final wording for the terms and privacy pages, reviewed by a lawyer
- Native speakers to review the Yoruba, Hausa and Igbo texts
- Pages and search for very long lists of codes
- Bulk QR download for printers
- Editing company details and the logo

## Run it yourself

You need Node.js 20.6 or newer and a free Firebase project.

**1. Install**
```bash
npm install
```

**2. Set up Firebase**
- Turn on **Email/Password** sign-in under Authentication.
- Create a **Firestore** database, and paste the contents of `firestore.rules` into its Rules tab. These rules keep everything private; the site reads and writes data only through its own server.
- Under Project settings, register a web app, and create a service account key (*Generate new private key*).

**3. Add your keys**

Copy `.env.local.example` to `.env.local` and fill in the seven values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Never share these or commit `.env.local` to GitHub.

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

### Putting it online (Vercel)

1. Add the same seven values in Vercel under Settings, Environment Variables, then redeploy. For `FIREBASE_PRIVATE_KEY`, paste the value without the surrounding quotation marks.
2. In Firebase, add your Vercel address under Authentication, Settings, Authorized domains.
3. In Firebase, open Firestore, TTL, and add a policy for the collection `rateLimits` on the field `expireAt`. This clears out the small guess-protection records after about a day.
4. Open `app/legal.tsx` and fill in your name, email and address for the terms and privacy pages. Put your support email in `app/rejected/page.tsx`.

## Project layout

```
app/
  page.tsx                  landing page
  signup, login, forgot-password
  onboarding, pending, rejected      the company application
  admin/                    review, approve and reject
  dashboard/                overview, codes, generate, settings
  verify/                   the customer check and its translations
  embed/verify/             the checker companies place on their sites
  terms, privacy            legal pages
  api/                      the server routes
lib/                        Firebase, sign-in and code logic
scripts/set-admin.mjs       makes an account the admin
```

## A note on the legal pages

The terms and privacy pages are written in plain language to match how Veriq works, but they are **starting drafts, not legal advice**. Have a lawyer review them before real customers use the product.