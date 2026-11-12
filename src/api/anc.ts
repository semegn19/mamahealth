import { apiRequest } from "./client";

export type WHOANCContact = {
  contact_number: number;
  gestational_weeks: number;
  target_date: string;
  title_en: string;
  title_am: string;
  description_en: string;
  description_am: string;
};

export type ANCScheduleResponse = {
  current_gestational_age_weeks: number;
  effective_lnmp_date: string | null;
  next_anc_contact: WHOANCContact | null;
  all_contacts: WHOANCContact[];
};

export type AppointmentCreatePayload = {
  appointment_date: string; // YYYY-MM-DD
  anc_contact_number: number;
  anc_contact_title?: string | null;
  anc_contact_title_am?: string | null;
  target_gestational_weeks?: number | null;
  reminder_lead_days?: number;
};

export type AppointmentResponse = {
  id: string;
  user_id: string;
  appointment_date: string;
  anc_contact_number: number;
  anc_contact_title?: string | null;
  anc_contact_title_am?: string | null;
  target_gestational_weeks?: number | null;
  reminder_lead_days: number;
  status: "scheduled" | "completed" | "missed";
  version: number;
};

export type AppointmentCalendarLinks = {
  google_calendar_url: string;
  ical_download_url: string;
};

export type AppointmentTransitionPayload = {
  action: "completed" | "missed" | "rescheduled";
  version: number;
  appointment_date?: string | null;
  anc_contact_number?: number | null;
};

export const ancApi = {
  getAncSchedule: () =>
    apiRequest<ANCScheduleResponse>("/users/me/anc-schedule", {
      method: "GET",
    }),

  getAppointmentCalendarLinks: () =>
    apiRequest<AppointmentCalendarLinks>("/users/me/appointment/calendar-link", {
      method: "GET",
    }),

  upsertAppointment: (payload: AppointmentCreatePayload) => {
    const key = `apt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return apiRequest<AppointmentResponse>("/users/me/appointment", {
      method: "POST",
      headers: {
        "Idempotency-Key": key,
      },
      body: JSON.stringify(payload),
    });
  },

  deleteAppointment: () =>
    apiRequest<{ status: string }>("/users/me/appointment", {
      method: "DELETE",
    }),

  transitionAppointment: (payload: AppointmentTransitionPayload) => {
    const key = `apt-tr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return apiRequest<AppointmentResponse>("/users/me/appointment/transition", {
      method: "POST",
      headers: {
        "Idempotency-Key": key,
      },
      body: JSON.stringify(payload),
    });
  },
};
