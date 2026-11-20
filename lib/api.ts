import { authClient } from "./auth-client";

const API = process.env.NEXT_PUBLIC_API_URL!;
let cached: { token: string; exp: number } | null = null;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function clearApiToken() {
  cached = null;
}

async function getToken() {
  const now = Date.now() / 1000;
  if (cached && cached.exp - 30 > now) return cached.token;
  const { data } = await authClient.token();
  if (!data?.token) return null;
  const b64 = data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  cached = { token: data.token, exp: JSON.parse(atob(b64)).exp };
  return data.token;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) cached = null;
    throw new ApiError(res.status, body?.message || "Request failed");
  }
  return body as T;
}