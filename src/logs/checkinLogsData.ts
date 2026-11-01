import type { CheckinDangerSign, CheckinEntry } from "../components/CheckinReportSheet";
import { MOCK_CHECKIN_LOGS } from "../mock/checkinLogs";

/**
 * A daily check-in log: the set of questions asked that day and what was recorded.
 * Backed by mock fixtures during prototyping; replaced by API history in production.
 */
export type CheckinLog = {
  id: string;
  date: Date;
  /** Morning or evening session. */
  session: "Morning" | "Evening";
  entries: CheckinEntry[];
  dangerSigns?: CheckinDangerSign[];
};

export const CHECKIN_LOGS: CheckinLog[] = MOCK_CHECKIN_LOGS;

