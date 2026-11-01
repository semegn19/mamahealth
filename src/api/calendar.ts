import { apiRequest } from "./client";

export type CalendarItemType = "event" | "task";

export type BackendCalendarItem = {
  id: string;
  user_id: string;
  title: string;
  title_am?: string | null;
  type: CalendarItemType;
  date: string; // YYYY-MM-DD
  time?: string | null; // HH:MM:SS or HH:MM
  reminder_at?: string | null; // ISO datetime
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type CalendarItemCreatePayload = {
  title: string;
  title_am?: string | null;
  type: CalendarItemType;
  date: string;
  time?: string | null;
  reminder_at?: string | null;
  completed?: boolean;
};

export type CalendarItemUpdatePayload = Partial<CalendarItemCreatePayload>;

export const calendarApi = {
  listItems: (params?: { from_date?: string; to_date?: string; type?: CalendarItemType }) => {
    const searchParams = new URLSearchParams();
    if (params?.from_date) searchParams.set("from_date", params.from_date);
    if (params?.to_date) searchParams.set("to_date", params.to_date);
    if (params?.type) searchParams.set("type", params.type);
    const query = searchParams.toString();
    return apiRequest<BackendCalendarItem[]>(`/users/me/calendar/items${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  },

  createItem: (payload: CalendarItemCreatePayload) =>
    apiRequest<BackendCalendarItem>("/users/me/calendar/items", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getById: (id: string) =>
    apiRequest<BackendCalendarItem>(`/users/me/calendar/items/${id}`, {
      method: "GET",
    }),

  updateItem: (id: string, payload: CalendarItemUpdatePayload) =>
    apiRequest<BackendCalendarItem>(`/users/me/calendar/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteItem: (id: string) =>
    apiRequest<{ status: string }>(`/users/me/calendar/items/${id}`, {
      method: "DELETE",
    }),
};
