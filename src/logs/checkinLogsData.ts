import type { CheckinDangerSign, CheckinEntry } from "../components/CheckinReportSheet";

/**
 * A daily check-in log: the set of questions asked that day and what was recorded.
 * In a real build this would come from stored check-in history.
 */
export type CheckinLog = {
  id: string;
  date: Date;
  /** Morning or evening session. */
  session: "Morning" | "Evening";
  entries: CheckinEntry[];
  dangerSigns?: CheckinDangerSign[];
};

const Q = {
  feeling: "How are you feeling today?",
  symptoms: "Any symptoms since yesterday?",
  food: "What did you eat today?",
  sleep: "How did you sleep?",
} as const;

function entry(
  question: string,
  answer: string | null,
  severity: number | null,
): CheckinEntry {
  return { question, answer, severity, skipped: answer === null };
}

export const CHECKIN_LOGS: CheckinLog[] = [
  {
    id: "2025-11-08",
    date: new Date(2025, 10, 8, 7, 48),
    session: "Morning",
    entries: [
      entry(Q.feeling, "A severe headache that has not eased after resting.", 88),
      entry(Q.symptoms, "Headache has lasted more than six hours, with some blurred vision.", 86),
      entry(Q.food, "Toast, yogurt, and water.", 15),
    ],
    dangerSigns: [
      {
        name: "Severe headache",
        detail: "Lasting 6+ hours, not eased by rest; blurred vision also reported.",
        severity: "Critical",
      },
    ],
  },
  {
    id: "2025-11-07",
    date: new Date(2025, 10, 7, 8, 12),
    session: "Morning",
    entries: [
      entry(Q.feeling, "Much better today, energy is back.", 20),
      entry(Q.symptoms, "No nausea since breakfast, just mild fatigue.", 30),
      entry(Q.food, "Oatmeal with banana, eggs, and a glass of milk.", 10),
    ],
  },
  {
    id: "2025-11-06",
    date: new Date(2025, 10, 6, 19, 40),
    session: "Evening",
    entries: [
      entry(Q.feeling, "Tired but steady, a bit of lower back pain.", 45),
      entry(Q.symptoms, "Back pain eased after resting, no headaches.", 40),
      entry(Q.food, "Lentil stew with rice and steamed vegetables.", 15),
    ],
  },
  {
    id: "2025-11-05",
    date: new Date(2025, 10, 5, 8, 5),
    session: "Morning",
    entries: [
      entry(Q.feeling, "A little queasy this morning, otherwise okay.", 55),
      entry(Q.symptoms, "Mild nausea and heartburn after dinner yesterday.", 50),
      entry(Q.food, "Toast, yogurt, chicken salad, and an orange.", 25),
    ],
  },
  {
    id: "2025-11-04",
    date: new Date(2025, 10, 4, 20, 15),
    session: "Evening",
    entries: [
      entry(Q.feeling, null, null),
      entry(Q.symptoms, "Feet were a bit swollen by evening.", 60),
      entry(Q.food, "Fish, rice, carrots, and a mango.", 20),
    ],
  },
  {
    id: "2025-11-03",
    date: new Date(2025, 10, 3, 8, 30),
    session: "Morning",
    entries: [
      entry(Q.feeling, "Good energy, slept through the night.", 15),
      entry(Q.symptoms, "No new symptoms, just normal tiredness.", 20),
      entry(Q.food, "Porridge with milk, an egg, and berries.", 10),
    ],
  },
  {
    id: "2025-11-02",
    date: new Date(2025, 10, 2, 18, 55),
    session: "Evening",
    entries: [
      entry(Q.feeling, "Headache started in the afternoon, resting now.", 65),
      entry(Q.symptoms, "Mild headache and some dizziness when standing up.", 70),
      entry(Q.food, "Vegetable soup, wholegrain bread, and milk.", 30),
    ],
  },
];

export function getCheckinLog(id?: string | null) {
  return CHECKIN_LOGS.find((log) => log.id === id) ?? null;
}

/** How many of a log's questions were answered (not skipped). */
export function answeredCount(log: CheckinLog) {
  return log.entries.filter((entry) => !entry.skipped).length;
}
