import { apiRequest } from "./client";

export type SummaryWindow = {
  basis?: string;
  start?: string;
  end_exclusive?: string;
  calendar_timezone?: string;
};

export type SummaryContentJson = {
  window?: SummaryWindow;
  anc_contact?: {
    contact_number: number;
    title_en: string;
    title_am: string;
    target_gestational_weeks: number;
    trimester: number;
    schedule_next_weeks?: number;
  };
  policy_version?: string;
  dangers?: Array<{
    date: string;
    category?: string;
    category_display?: string;
    category_display_en?: string;
    raw_text?: string;
    severity?: string;
    [key: string]: unknown;
  }>;
  symptoms?: Array<{
    date: string;
    category_display?: string;
    category_display_en?: string;
    raw_text?: string;
    severity?: string;
    [key: string]: unknown;
  }>;
  foods?: Array<Record<string, unknown>>;
  food_group_shares?: Record<string, number>;
  supplements?: Array<Record<string, unknown>>;
  checkin_count?: number;
  missed_days?: number;
  [key: string]: unknown;
};

export type BackendSummaryResponse = {
  id: string;
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  generated_at: string; // ISO
  share_link_slug?: string | null;
  qr_code_url?: string | null;
  anc_contact_number?: number | null;
  anc_contact_title?: string | null;
  anc_contact_title_am?: string | null;
  target_gestational_weeks?: number | null;
  content_json: SummaryContentJson;
};

export type ShareSummaryPayload = {
  intended_audience?: string;
  expires_hours?: number;
};

export type ShareSummaryResponse = {
  share_id: string;
  share_link_slug: string;
  url: string;
  expires_at: string;
};

export const reportsApi = {
  getLatestSummary: () =>
    apiRequest<BackendSummaryResponse>("/summary/latest", {
      method: "GET",
    }),

  generateSummary: (payload?: { period_start?: string; period_end?: string }) => {
    const key = `sum-gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return apiRequest<BackendSummaryResponse>("/summary/generate", {
      method: "POST",
      headers: {
        "Idempotency-Key": key,
      },
      body: JSON.stringify(payload || {}),
    });
  },

  getPublicSummary: (slug: string) =>
    apiRequest<BackendSummaryResponse>(`/summary/${slug}`, {
      method: "GET",
    }),

  createShare: (summaryId: string, payload?: ShareSummaryPayload) =>
    apiRequest<ShareSummaryResponse>(`/summary/${summaryId}/shares`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  checkAutomaticSummary: () =>
    apiRequest<{ status: string; message?: string; summary?: BackendSummaryResponse }>(
      "/summary/check-automatic",
      { method: "POST" },
    ),
};
