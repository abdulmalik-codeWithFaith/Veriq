// Makes one account the Veriq admin. Run once:
//   node --env-file=.env.local scripts/set-admin.mjs you@email.com
// Create the account first (sign up on the site, or add the user in the Firebase console).
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/set-admin.mjs you@email.com");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const user = await getAuth().getUserByEmail(email);
await getAuth().setCustomUserClaims(user.uid, { admin: true });
console.log(`${email} is now the admin. Log out and log in again for it to take effect.`);