/**
 * Central repository of mock/dummy data for Mama Health frontend.
 *
 * All mock records, starter data sets, and simulated finding objects have been
 * cleanly decoupled from feature components. During backend integration, components
 * can switch to API services while keeping these mocks available as fallbacks,
 * offline fixtures, or for instant regression/revert capabilities.
 */

export * from "./calendar";
export * from "./checkinLogs";
export * from "./notifications";
export * from "./reports";
export * from "./profile";
export * from "./voiceCheckin";
export * from "./dashboard";
