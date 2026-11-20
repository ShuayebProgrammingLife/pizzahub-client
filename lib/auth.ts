import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

// Reuse one Mongo connection during dev hot-reloads
const g = globalThis as unknown as { _mongo?: MongoClient };
const client = g._mongo ?? new MongoClient(process.env.MONGODB_URI!);
if (process.env.NODE_ENV !== "production") g._mongo = client;
const db = client.db(process.env.DB_NAME || "pizzahub");

const PUBLIC_ROLES = ["vendor", "customer"];

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.BETTER_AUTH_URL!],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    modelName: "users",
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "customer", input: true },
      businessName: { type: "string", required: false, input: true },
      isBlocked: { type: "boolean", required: false, defaultValue: false, input: false },
      subscriptionPlan: { type: "string", required: false, defaultValue: "free", input: false },
      subscriptionExpiresAt: { type: "date", required: false, input: false },
    },
  },

  // Server-side validation on sign-up (the UI check alone is not enough)
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const { password, role } = (ctx.body ?? {}) as { password?: string; role?: string };
        if (!password || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password needs at least one uppercase and one lowercase letter",
          });
        }
        if (role && !PUBLIC_ROLES.includes(role)) {
          throw new APIError("BAD_REQUEST", { message: "Invalid account role" });
        }
      }
    }),
  },

  // Second layer of defense (also covers Google sign-up)
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = (user as { role?: string }).role;
          return { data: { ...user, role: role === "vendor" ? "vendor" : "customer" } };
        },
      },
      update: {
        before: async (data) => {
          // users can never change these through profile updates
          const { role, isBlocked, subscriptionPlan, subscriptionExpiresAt, ...safe } =
            data as Record<string, unknown>;
          return { data: safe };
        },
      },
    },
  },

  // Issues JWTs that the Express server will verify (Step 3)
  plugins: [jwt()],
});