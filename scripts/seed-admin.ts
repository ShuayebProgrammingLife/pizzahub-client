import { MongoClient } from "mongodb";
import { auth } from "../lib/auth";

async function main() {
  const name = process.env.ADMIN_NAME || "PizzaHub Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const users = client.db(process.env.DB_NAME || "pizzahub").collection("users");

  if (!(await users.findOne({ email }))) {
    // goes through Better Auth so the password is hashed correctly
    await auth.api.signUpEmail({ body: { name, email, password } });
    console.log("Admin account created");
  }

  // Direct DB update is the only way to become admin
  await users.updateOne(
    { email },
    { $set: { role: "admin", isBlocked: false, emailVerified: true } }
  );
  console.log(`Admin ready: ${email}`);

  await client.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});