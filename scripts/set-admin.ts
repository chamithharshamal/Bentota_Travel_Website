/**
 * Gives an existing Firebase Auth user the admin role.
 *
 *   npm run set-admin -- owner@example.com
 *
 * Create the user first in Firebase console → Authentication → Users → Add user.
 */
import { auth } from "./firebase-admin-script";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run set-admin -- someone@example.com");
    process.exit(1);
  }
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), role: "admin" });
    await auth.revokeRefreshTokens(user.uid);
    console.log(`✔ ${email} is now an admin. Sign in again at /admin/login.`);
  } catch (error) {
    if ((error as { code?: string }).code === "auth/user-not-found") {
      console.error(`No user with the email ${email}. Add the user in Firebase console → Authentication first.`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

void main();
