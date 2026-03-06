const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "");

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface User {
  id: number;
  email: string;
  admin: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.errors?.join(", ") || `HTTP ${res.status}`);
  }

  return data as T;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await request<{ user: User }>("/api/v1/auth/me");
    return data.user;
  } catch {
    clearToken();
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/v1/auth/sign_in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function signUp(
  email: string,
  password: string,
  password_confirmation: string
): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/v1/auth/sign_up", {
    method: "POST",
    body: JSON.stringify({ email, password, password_confirmation }),
  });
  setToken(data.token);
  return data;
}

export function signOut(): void {
  clearToken();
}

export function getGoogleAuthUrl(): string {
  return `${API_BASE}/api/v1/auth/google_oauth2`;
}
