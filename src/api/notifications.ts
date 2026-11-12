import { apiRequest } from "./client";

export interface BackendNotificationItem {
  id: string;
  user_id: string;
  type: string;
  message: string;
  due_at: string;
  dismissed: boolean;
  created_at: string;
  extra_data?: Record<string, unknown> | null;
}

export const notificationsApi = {
  /**
   * List active (undismissed) notifications for the current user.
   */
  async list(limit = 50, cursor?: string): Promise<BackendNotificationItem[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiRequest<BackendNotificationItem[]>(`/notifications?${params.toString()}`);
  },

  /**
   * Dismiss a specific notification.
   */
  async dismiss(
    notificationId: string
  ): Promise<{ status: string; notification: BackendNotificationItem }> {
    return apiRequest<{ status: string; notification: BackendNotificationItem }>(
      `/notifications/${notificationId}/dismiss`,
      { method: "POST" }
    );
  },
};
