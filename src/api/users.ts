import { apiRequest } from "./client";

export type CurrentPregnancyStatus = {
  gestational_age_weeks?: number | null;
  gestational_age_days?: number | null;
  gestational_age_total_days?: number | null;
  formatted_age_am?: string | null;
  formatted_age_en?: string | null;
  trimester?: string | null;
  trimester_info?: {
    number: number;
    key: string;
    name_en: string;
    name_am: string;
    week_range: string;
  } | null;
  estimated_due_date?: string | null;
  effective_lnmp_date?: string | null;
  is_gestational_age_manual?: boolean;
  days_until_edd?: number | null;
};

export type UserSupplement = {
  id: string;
  user_id: string;
  name: string;
  active: boolean;
  reminder_enabled: boolean;
  reminder_time?: string | null;
  created_at: string;
};

export type SupplementCreatePayload = {
  name: string;
  active?: boolean;
  reminder_enabled?: boolean;
  reminder_time?: string | null;
};

export type SupplementUpdatePayload = {
  name?: string;
  active?: boolean;
  reminder_enabled?: boolean;
  reminder_time?: string | null;
};

export type UserSettingsUpdatePayload = {
  hospital?: string | null;
  appointment?: {
    appointment_date?: string;
    anc_contact_number?: number;
    anc_contact_title?: string;
    anc_contact_title_am?: string;
    target_gestational_weeks?: number;
    reminder_lead_days?: number;
  } | null;
  supplements?: Array<{
    id?: string;
    name?: string;
    active?: boolean;
    reminder_enabled?: boolean;
    reminder_time?: string | null;
  }> | null;
  maternal_profile?: Partial<OnboardingSubmitPayload> | null;
};

export type UserAppointment = {
  id: string;
  user_id: string;
  appointment_date: string;
  anc_contact_number: number;
  anc_contact_title?: string | null;
  anc_contact_title_am?: string | null;
  target_gestational_weeks?: number | null;
  reminder_lead_days?: number;
};

export type UserProfileResponse = {
  id: string;
  email: string | null;
  name?: string | null;
  created_at: string;
  age?: number | null;
  area?: string | null;
  pregnancy_counting_method?: string | null;
  lnmp_date?: string | null;
  ultrasound_date?: string | null;
  ultrasound_weeks?: number | null;
  gestational_age_weeks?: number | null;
  gestational_age_days?: number | null;
  is_gestational_age_manual?: boolean;
  effective_lnmp_date?: string | null;
  estimated_due_date?: string | null;
  trimester?: string | null;
  total_pregnancies?: number | null;
  live_births?: number | null;
  had_c_section?: boolean | null;
  child_passed_away?: boolean | null;
  past_pregnancy_complications?: string[];
  known_medical_conditions?: string[];
  custom_medical_condition?: string | null;
  malaria_endemic_area?: boolean | null;
  current_medications?: string | null;
  hospital?: string | null;
  onboarding_completed: boolean;
  current_pregnancy_status?: CurrentPregnancyStatus | null;
  supplements?: UserSupplement[];
  appointment?: UserAppointment | null;
};

export type OnboardingSubmitPayload = {
  name?: string | null;
  age?: number | null;
  area?: "urban" | "rural" | string | null;
  pregnancy_counting_method?: "lnmp" | "ultrasound" | "manual";
  lnmp_date?: string | null;
  manual_gestational_weeks?: number | null;
  manual_gestational_days?: number | null;
  gestational_age_weeks?: number | null;
  gestational_age_days?: number | null;
  estimated_due_date?: string | null;
  total_pregnancies?: number | null;
  live_births?: number | null;
  had_c_section?: boolean | null;
  child_passed_away?: boolean | null;
  past_pregnancy_complications?: string[];
  known_medical_conditions?: string[];
  custom_medical_condition?: string | null;
  malaria_endemic_area?: boolean | null;
  current_medications?: string | null;
  supplements?: string[];
  hospital?: string | null;
};

export type GestationalAgeCalculatePayload = {
  pregnancy_counting_method?: "lnmp" | "ultrasound" | "manual" | string;
  lnmp_date?: string | null;
  ultrasound_date?: string | null;
  ultrasound_weeks?: number | null;
  ultrasound_days?: number | null;
  manual_gestational_weeks?: number | null;
  manual_gestational_days?: number | null;
  as_of_date?: string | null;
};

export const usersApi = {
  async calculateGestationalAge(payload: GestationalAgeCalculatePayload): Promise<CurrentPregnancyStatus> {
    return apiRequest<CurrentPregnancyStatus>("/users/calculate-gestational-age", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<UserProfileResponse> {
    return apiRequest<UserProfileResponse>("/users/me");
  },

  async submitOnboarding(payload: OnboardingSubmitPayload): Promise<UserProfileResponse> {
    return apiRequest<UserProfileResponse>("/users/me/onboarding", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateHospital(hospital: string): Promise<UserProfileResponse> {
    return apiRequest<UserProfileResponse>("/users/me/hospital", {
      method: "PUT",
      body: JSON.stringify({ hospital }),
    });
  },

  async updateProfile(payload: Partial<OnboardingSubmitPayload>): Promise<UserProfileResponse> {
    return apiRequest<UserProfileResponse>("/users/me/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async updateSettings(payload: UserSettingsUpdatePayload): Promise<UserProfileResponse> {
    return apiRequest<UserProfileResponse>("/users/me/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async listSupplements(): Promise<UserSupplement[]> {
    return apiRequest<UserSupplement[]>("/users/me/supplements");
  },

  async createSupplement(payload: SupplementCreatePayload): Promise<UserSupplement> {
    return apiRequest<UserSupplement>("/users/me/supplements", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        active: payload.active ?? true,
        reminder_enabled: payload.reminder_enabled ?? true,
        reminder_time: payload.reminder_time
          ? (payload.reminder_time.length === 5 ? `${payload.reminder_time}:00` : payload.reminder_time)
          : null,
      }),
    });
  },

  async updateSupplement(supplementId: string, payload: SupplementUpdatePayload): Promise<UserSupplement> {
    return apiRequest<UserSupplement>(`/users/me/supplements/${supplementId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...payload,
        reminder_time:
          payload.reminder_time !== undefined
            ? payload.reminder_time
              ? payload.reminder_time.length === 5
                ? `${payload.reminder_time}:00`
                : payload.reminder_time
              : null
            : undefined,
      }),
    });
  },

  async deleteSupplement(supplementId: string): Promise<{ status: string }> {
    return apiRequest<{ status: string }>(`/users/me/supplements/${supplementId}`, {
      method: "DELETE",
    });
  },

  async deleteAppointment(): Promise<{ status: string }> {
    return apiRequest<{ status: string }>("/users/me/appointment", {
      method: "DELETE",
    });
  },

  async verifyFood(payload: {
    food_groups?: Array<"grains" | "proteins" | "dairy" | "fruits_and_vegetables">;
    raw_text?: string;
    items?: string[];
  }): Promise<{ status: string; food_groups: string[]; raw_text: string; logged_at: string }> {
    const key = `food-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return apiRequest("/users/me/food/verify", {
      method: "POST",
      headers: { "Idempotency-Key": key },
      body: JSON.stringify(payload),
    });
  },

  async verifySupplement(payload: {
    supplement_id?: string;
    supplement_name?: string;
    taken_today: boolean;
    raw_text?: string;
  }): Promise<{ status: string; supplement_name: string; taken_today: boolean; logged_at: string }> {
    const key = `supp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const url = payload.supplement_id
      ? `/users/me/supplements/${payload.supplement_id}/verify`
      : "/users/me/supplements/verify";
    return apiRequest(url, {
      method: "POST",
      headers: { "Idempotency-Key": key },
      body: JSON.stringify(payload),
    });
  },
};
