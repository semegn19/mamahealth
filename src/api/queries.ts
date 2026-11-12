"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "./client";
import { usersApi, type UserProfileResponse } from "./users";
import { ancApi, type ANCScheduleResponse } from "./anc";
import { calendarApi, type BackendCalendarItem } from "./calendar";
import { checkinApi, type BackendCheckInHistoryItem } from "./checkin";
import { reportsApi, type BackendSummaryResponse } from "./reports";

/**
 * Standard query keys for in-memory TanStack Query caching.
 */
export const queryKeys = {
  user: ["user", "me"] as const,
  ancSchedule: ["anc", "schedule"] as const,
  calendarItems: ["calendar", "items"] as const,
  checkinHistory: (limit = 20) => ["checkin", "history", limit] as const,
  latestSummary: ["reports", "latest"] as const,
  reportsList: ["reports", "list"] as const,
};

/**
 * Fetches the authenticated user profile, pregnancy metrics, supplements, and appointment.
 * Cached in memory with a 60s stale time; returns immediately on route transitions.
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
  const hasToken = typeof window !== "undefined" && Boolean(getAccessToken());
  const isEnabled = (options?.enabled ?? true) && hasToken;

  return useQuery<UserProfileResponse>({
    queryKey: queryKeys.user,
    queryFn: () => usersApi.getMe(),
    enabled: isEnabled,
  });
}

/**
 * Fetches the WHO ANC contact schedule and next recommended visit for the mother.
 */
export function useAncSchedule(options?: { enabled?: boolean }) {
  const hasToken = typeof window !== "undefined" && Boolean(getAccessToken());
  const isEnabled = (options?.enabled ?? true) && hasToken;

  return useQuery<ANCScheduleResponse>({
    queryKey: queryKeys.ancSchedule,
    queryFn: () => ancApi.getAncSchedule(),
    enabled: isEnabled,
  });
}

/**
 * Fetches all calendar appointments and reminder items from the database.
 */
export function useCalendarItems(options?: { enabled?: boolean }) {
  const hasToken = typeof window !== "undefined" && Boolean(getAccessToken());
  const isEnabled = (options?.enabled ?? true) && hasToken;

  return useQuery<BackendCalendarItem[]>({
    queryKey: queryKeys.calendarItems,
    queryFn: () => calendarApi.listItems(),
    enabled: isEnabled,
  });
}

/**
 * Fetches daily check-in sessions and verified clinical history items.
 */
export function useCheckinHistory(limit = 20, options?: { enabled?: boolean }) {
  const hasToken = typeof window !== "undefined" && Boolean(getAccessToken());
  const isEnabled = (options?.enabled ?? true) && hasToken;

  return useQuery<BackendCheckInHistoryItem[]>({
    queryKey: queryKeys.checkinHistory(limit),
    queryFn: () => checkinApi.getHistory({ limit }),
    enabled: isEnabled,
  });
}

/**
 * Fetches the latest compiled clinician summary.
 */
export function useLatestSummary(options?: { enabled?: boolean }) {
  const hasToken = typeof window !== "undefined" && Boolean(getAccessToken());
  const isEnabled = (options?.enabled ?? true) && hasToken;

  return useQuery<BackendSummaryResponse | null>({
    queryKey: queryKeys.latestSummary,
    queryFn: async () => {
      try {
        return await reportsApi.getLatestSummary();
      } catch {
        return null;
      }
    },
    enabled: isEnabled,
  });
}

/**
 * Invalidation helpers to trigger fresh background fetches after user mutations.
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateUser: () => queryClient.invalidateQueries({ queryKey: queryKeys.user }),
    invalidateAnc: () => queryClient.invalidateQueries({ queryKey: queryKeys.ancSchedule }),
    invalidateCalendar: () => queryClient.invalidateQueries({ queryKey: queryKeys.calendarItems }),
    invalidateCheckinHistory: () => queryClient.invalidateQueries({ queryKey: ["checkin", "history"] }),
    invalidateReports: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.latestSummary });
    },
    invalidateAll: () => queryClient.invalidateQueries(),
    clearAll: () => queryClient.clear(),
  };
}
