import { apiRequest } from "./client";

export type CheckInSymptomItem = {
  category?: string;
  category_display?: string;
  category_display_en?: string;
  raw_text?: string;
  severity?: string;
  duration?: string;
  danger_sign?: boolean;
  [key: string]: unknown;
};

export type CheckInFoodItem = {
  raw_text?: string;
  food_group?: string;
  food_group_am?: string;
  [key: string]: unknown;
};

export type CheckInSupplementItem = {
  name?: string;
  taken?: boolean;
  dose?: string;
  [key: string]: unknown;
};

export type BackendCheckInHistoryItem = {
  id: string;
  timestamp: string; // ISO
  recorded_at?: string | null;
  received_at?: string | null;
  client_confirmed_at?: string | null;
  capture_source?: "online" | "offline_form";
  symptoms?: CheckInSymptomItem[] | null;
  food_log?: CheckInFoodItem[];
  supplement_check?: CheckInSupplementItem[];
  closing_mentions?: Array<Record<string, unknown>> | null;
  danger_sign_triggered: boolean;
  summary_text_am?: string | null;
  summary_text_en?: string | null;
};

export const checkinApi = {
  getHistory: (params?: { limit?: number; cursor?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    const query = searchParams.toString();
    return apiRequest<BackendCheckInHistoryItem[]>(
      `/checkin/history${query ? `?${query}` : ""}`,
      { method: "GET" },
    );
  },

  getHistoryDetail: (checkinId: string) =>
    apiRequest<BackendCheckInHistoryItem>(`/checkin/history/${checkinId}`, {
      method: "GET",
    }),
};
