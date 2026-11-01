import type { Profile } from "../settings/profileStore";

/**
 * Seed profile for prototype display.
 * Replaced when GET /users/profile is connected to the backend.
 */
export const MOCK_DEFAULT_PROFILE: Profile = {
  name: "Amara Bennett",
  email: "amara.bennett@example.com",
  nextAncDate: "2025-10-09",
  supplements: [
    { id: "iron", name: "Iron", reminderTime: "08:00" },
    { id: "folic-acid", name: "Folic acid", reminderTime: "08:00" },
  ],
};
