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

export type CheckinStagePrompt = {
  stage: "symptoms" | "food" | "supplement" | "closing" | string;
  category_am: string;
  category_en: string;
  prompt_am: string;
  prompt_en: string;
  audio_url: string;
};

export type CheckInStartResponse = {
  version: number;
  stage_status: string;
  session_id: string;
  stage: string;
  stage_order?: string[];
  question_prompt: string;
  question_audio_url?: string | null;
};

export type CheckInRespondResponse = {
  version: number;
  stage_status: string;
  session_id: string;
  stage: string;
  transcript: string;
  pending_items: Array<Record<string, unknown>>;
  danger_sign_triggered?: boolean;
};

export type ItemVerificationPayload = {
  action?: "verify" | "add" | "discard";
  item_id?: string | null;
  confirmed: boolean;
  corrected_value?: Record<string, unknown> | null;
};

export type VerifyItemResponse = {
  version: number;
  stage_status: string;
  session_id: string;
  stage: string;
  pending_items: Array<Record<string, unknown>>;
  confirmed_count: number;
  danger_sign_triggered: boolean;
};

export type CompleteStageResponse = {
  version: number;
  stage_status: string;
  session_id: string;
  stage_completed: string;
  danger_sign_triggered: boolean;
  summary_text_am?: string | null;
  summary_text_en?: string | null;
  next_stage?: string | null;
  question_prompt?: string | null;
  question_audio_url?: string | null;
  session_completed: boolean;
  check_in_id?: string | null;
};

export const checkinApi = {
  getPrompts: () =>
    apiRequest<CheckinStagePrompt[]>("/checkin/prompts", { method: "GET" }),

  startSession: () => {
    const key = `chk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return apiRequest<CheckInStartResponse>("/checkin/start", {
      method: "POST",
      headers: {
        "Idempotency-Key": key,
      },
    });
  },

  respond: (sessionId: string, audioBlob: Blob, version: number) => {
    const key = `chk-rsp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const formData = new FormData();
    formData.append("audio", audioBlob, "checkin.webm");

    return apiRequest<CheckInRespondResponse>(`/checkin/${sessionId}/respond`, {
      method: "POST",
      headers: {
        "X-Session-Version": String(version),
        "Idempotency-Key": key,
      },
      body: formData,
    });
  },

  verify: (sessionId: string, items: ItemVerificationPayload[], version: number) => {
    const key = `chk-vrf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return apiRequest<VerifyItemResponse>(`/checkin/${sessionId}/verify`, {
      method: "POST",
      headers: {
        "X-Session-Version": String(version),
        "Idempotency-Key": key,
      },
      body: JSON.stringify({ items }),
    });
  },

  completeStage: (sessionId: string, skip: boolean, version: number) => {
    const key = `chk-cpl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return apiRequest<CompleteStageResponse>(`/checkin/${sessionId}/complete`, {
      method: "POST",
      headers: {
        "X-Session-Version": String(version),
        "Idempotency-Key": key,
      },
      body: JSON.stringify({ skip }),
    });
  },

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

  syncOffline: (payload: OfflineCheckInPayload) =>
    apiRequest<OfflineCheckInResponse>("/checkin/offline-sync", {
      method: "POST",
      headers: {
        "Idempotency-Key": payload.client_submission_id,
      },
      body: JSON.stringify(payload),
    }),
};

export type OfflineCheckInPayload = {
  schema_version: 1;
  client_submission_id: string;
  recorded_at: string;
  client_confirmed_at: string;
  confirmed: true;
  symptoms: Array<{
    raw_text: string;
    category?: string | null;
    severity?: "mild" | "moderate" | "severe" | "unspecified";
  }>;
  food_log: Array<{
    raw_text: string;
    food_groups?: Array<"grains" | "proteins" | "dairy" | "fruits_and_vegetables">;
    items?: string[];
  }>;
  supplement_check: Array<{
    raw_text: string;
    supplement_name?: string;
    taken_today?: boolean | null;
  }>;
  closing_mentions: Array<{
    raw_text: string;
    topic?:
      | "dietary_intake"
      | "supplement_taken"
      | "therapeutic_food"
      | "breastfeeding_intent"
      | "other"
      | "general_closing";
  }>;
};

export type OfflineCheckInResponse = {
  client_submission_id: string;
  check_in_id: string;
  status: "synced";
  danger_sign_triggered: boolean;
};
