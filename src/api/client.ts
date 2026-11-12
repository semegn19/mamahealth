/**
 * Core HTTP Client for communicating with the EnatAI / MamaHealth FastAPI backend.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

const ACCESS_TOKEN_KEY = "mama_access_token";
const REFRESH_TOKEN_KEY = "mama_refresh_token";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Completely clears all local user session caches to prevent
 * notifications, check-ins, or profile data leaking between accounts.
 */
export function clearUserSessionData(): void {
  if (typeof window === "undefined") return;
  clearTokens();
  const keysToRemove = [
    "mama-health-notifications-v1",
    "aurelia-notifications-v1",
    "mama-health-profile-v1",
    "aurelia-profile-v1",
    "mama-health-calendar-items-v1",
    "aurelia-calendar-items-v1",
    "mama-health-checkin-history-v1",
    "mama-health-onboarding-v1",
    "aurelia-onboarding-v1",
    "mama-health-latest-report-v1",
    "mama-health-due-date-v1",
    "aurelia-due-date-v1",
    "mama-health-quick-food-v1",
    "aurelia-quick-food-v1",
    "mama-health-quick-supplements-v1",
    "aurelia-quick-supplements-v1",
  ];
  for (const k of keysToRemove) {
    try {
      localStorage.removeItem(k);
    } catch {
      // Ignore storage access errors
    }
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const currentRefresh = getRefreshToken();
  if (!currentRefresh) {
    clearTokens();
    return null;
  }

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: currentRefresh }),
      });

      if (!response.ok) {
        clearTokens();
        return null;
      }

      const data = await response.json();
      if (data.access_token) {
        setTokens(data.access_token, data.refresh_token || currentRefresh);
        return data.access_token as string;
      }
      clearTokens();
      return null;
    } catch {
      clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
  retryOn401 = true,
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    throw new ApiError(0, `Unable to connect to server: ${msg}`);
  }

  // Handle Token Expiry & Automatic Refresh
  if (response.status === 401 && retryOn401 && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      return apiRequest<T>(path, { ...options, headers }, false);
    }
  }

  if (!response.ok) {
    let errorDetail: unknown = null;
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const parsed = await response.json();
      errorDetail = parsed;
      if (typeof parsed?.detail === "string") {
        errorMessage = parsed.detail;
      } else if (typeof parsed?.message === "string") {
        errorMessage = parsed.message;
      }
    } catch {
      // Body not JSON
    }
    throw new ApiError(response.status, errorMessage, errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
