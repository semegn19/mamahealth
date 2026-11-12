import {
  FOOD_GROUPS,
  SEVERITY_LEVELS,
  type DayRecord,
  type Severity,
  type SupplementReport,
} from "./reportData";
import { getCanonicalDangerKey } from "./reportCatalog";

export type DynamicReportMetrics = {
  hasData: boolean;
  days: DayRecord[];
  calendarCells: (DayRecord | null)[];
  totalDays: number;
  recordedDays: number;
  daysMissed: number;
  checkinRate: number;
  daysWithSymptoms: number;
  symptomTotals: { name: string; count: number; avg: number }[];
  topSymptoms: { name: string; count: number; avg: number }[];
  leading: { name: string; count: number; avg: number } | null;
  foodCounts: number[];
  avgFoodGroups: number;
  foodCoverageDays: number;
  itemsByGroup: Record<string, { name: string; times: number }[]>;
  supplementReports: SupplementReport[];
  periodLabel: string;
};

export function matchesSupplement(aNameOrId: string, bNameOrId: string): boolean {
  const a = (aNameOrId || "").toLowerCase().trim();
  const b = (bNameOrId || "").toLowerCase().trim();
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.replace(/[^a-z0-9]/g, "") === b.replace(/[^a-z0-9]/g, "")) return true;

  const aIsIFA =
    a.includes("iron") ||
    a.includes("ifa") ||
    a.includes("folic") ||
    a.includes("ብረት") ||
    a.includes("ፎሊክ");
  const bIsIFA =
    b.includes("iron") ||
    b.includes("ifa") ||
    b.includes("folic") ||
    b.includes("ብረት") ||
    b.includes("ፎሊክ");
  if (aIsIFA && bIsIFA) return true;

  const aIsCalcium = a.includes("calcium") || a.includes("ካልሲየም");
  const bIsCalcium = b.includes("calcium") || b.includes("ካልሲየም");
  if (aIsCalcium && bIsCalcium) return true;

  const aIsMMN =
    a.includes("mmn") ||
    a.includes("micronutrient") ||
    a.includes("ማይክሮኒውትሪየንት");
  const bIsMMN =
    b.includes("mmn") ||
    b.includes("micronutrient") ||
    b.includes("ማይክሮኒውትሪየንት");
  if (aIsMMN && bIsMMN) return true;

  return false;
}

export function findSupplementEntry(entries?: any[]): any | null {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const match = entries.find((e) => {
    const q = `${e.question || ""} ${e.question_am || ""}`.toLowerCase();
    return (
      q.includes("supplement") ||
      q.includes("vitamin") ||
      q.includes("iron") ||
      q.includes("calcium") ||
      q.includes("ifa") ||
      q.includes("folic") ||
      q.includes("እንክብል") ||
      q.includes("ቫይታሚን") ||
      q.includes("ብረት") ||
      q.includes("ፎሊክ") ||
      q.includes("ካልሲየም")
    );
  });
  if (match) return match;
  return entries[2] ?? null;
}

export function canonicalSupplementName(rawName: string): string {
  if (matchesSupplement(rawName, "ifa") || matchesSupplement(rawName, "iron")) {
    return "Iron & Folic Acid (IFA)";
  }
  if (matchesSupplement(rawName, "calcium")) {
    return "Calcium Supplement";
  }
  if (matchesSupplement(rawName, "mmn")) {
    return "Multiple Micronutrients (MMN)";
  }
  return rawName.charAt(0).toUpperCase() + rawName.slice(1);
}

export function evaluateSupplementAnswer(
  answer: string | null | undefined,
  supId: string,
  supName: string,
): boolean | null {
  if (!answer) return null;
  const rawAns = String(answer).toLowerCase().trim();
  if (!rawAns) return null;
  if (/skipped|skip\b|ተዘሏል/.test(rawAns)) return false;

  const isIFA = matchesSupplement(supId, "ifa") || matchesSupplement(supName, "ifa");
  const isCalcium = matchesSupplement(supId, "calcium") || matchesSupplement(supName, "calcium");
  const isMMN = matchesSupplement(supId, "mmn") || matchesSupplement(supName, "mmn");

  let relevantText = rawAns;
  const segments = rawAns.split(/[,;\n،]+/);
  if (segments.length > 1) {
    const matchingSegment = segments.find((seg) => {
      if (
        isIFA &&
        (seg.includes("iron") ||
          seg.includes("ifa") ||
          seg.includes("folic") ||
          seg.includes("ብረት") ||
          seg.includes("ፎሊክ"))
      )
        return true;
      if (isCalcium && (seg.includes("calcium") || seg.includes("ካልሲየም"))) return true;
      if (isMMN && (seg.includes("mmn") || seg.includes("ማይክሮኒውትሪየንት"))) return true;
      return false;
    });
    if (matchingSegment) {
      relevantText = matchingSegment;
    }
  }

  const isNegative =
    /\bnot\s+taken\b|\bnot\b|\bdidn't\b|\bdid\s+not\b|\bmissed\b|\bforgot\b|\bno\b|\bnone\b|\bnever\b|አልተወሰደም|አልወሰድኩም|አልወሰድኩ|አልወሰደም|ረሳሁ|(?:\s|^)አይ(?:\s|$)/i.test(
      relevantText,
    );
  if (isNegative) return false;

  const isPositive =
    /(?<!not\s+)(?<!didn't\s+)\b(taken|took|done|yes|yeah|yep|sure|already|both|all)\b|(?<!አል)(?:ተወስዷል|ተወስዷ|ወሰድኩ|ወሰድኩት|ወስጃለሁ)|(?:\s|^)አዎ(?:\s|$)/i.test(
      relevantText,
    );
  if (isPositive) return true;
  return null;
}

export function localizeSymptom(
  name: string | null | undefined,
  isAmharic: boolean,
  t: (path: string, params?: any) => string,
): string {
  if (!name) return "";
  const clean = String(name).replace(/^reports\.symptomsMap\./, "").trim();
  const key = `reports.symptomsMap.${clean}`;
  const tr = t(key);
  if (tr && tr !== key && !tr.startsWith("reports.symptomsMap.")) {
    return tr;
  }
  return clean;
}

export function computeReportMetrics(
  contentJson?: any,
  logs?: any[],
  rangeLabel?: string,
): DynamicReportMetrics {
  const hasContent =
    Boolean(contentJson?.checkin_count) ||
    Boolean(contentJson?.danger_signs?.length) ||
    Boolean(contentJson?.recorded_symptoms?.length) ||
    Boolean(contentJson?.general_symptoms?.length) ||
    Boolean(contentJson?.symptoms?.length) ||
    Boolean(contentJson?.food_logs?.length) ||
    Boolean(contentJson?.supplement_observations?.length) ||
    Boolean(contentJson?.dangers?.length);
  const hasLogs = Boolean(logs && Array.isArray(logs) && logs.length > 0);

  if (!hasContent && !hasLogs) {
    return {
      hasData: false,
      days: [],
      calendarCells: [],
      totalDays: 0,
      recordedDays: 0,
      daysMissed: 0,
      checkinRate: 0,
      daysWithSymptoms: 0,
      symptomTotals: [],
      topSymptoms: [],
      leading: null,
      foodCounts: [0, 0, 0, 0, 0],
      avgFoodGroups: 0,
      foodCoverageDays: 0,
      itemsByGroup: { Grains: [], Protein: [], Dairy: [], Fruit: [], Veg: [] },
      supplementReports: [],
      periodLabel: rangeLabel || "Current Period",
    };
  }

  const activeSupplementsFromBackend = contentJson?.supplement_adherence?.by_supplement?.map((b: any) => ({
    id: String(b.supplement_name).toLowerCase().replace(/[^a-z0-9]/g, "-"),
    name: canonicalSupplementName(b.supplement_name),
  })) ?? [];

  // Determine window (14 days default ending on latest activity date or today)
  let endDate = new Date();
  if (contentJson?.window?.end_exclusive) {
    endDate = new Date(contentJson.window.end_exclusive);
  } else if (hasLogs && logs![0]?.date) {
    const sorted = [...logs!].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    endDate = new Date(sorted[0].date);
  }

  const daysCount = 14;
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - (daysCount - 1));

  const days: DayRecord[] = [];
  const dayLogsMap = new Map<string, any[]>();

  if (hasLogs) {
    for (const log of logs!) {
      const d = new Date(log.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const existing = dayLogsMap.get(key) || [];
      existing.push(log);
      dayLogsMap.set(key, existing);
    }
  }

  const foodItemCounts: Record<string, Map<string, number>> = {
    Grains: new Map(),
    Protein: new Map(),
    Dairy: new Map(),
    Fruit: new Map(),
    Veg: new Map(),
  };

  for (let i = 0; i < daysCount; i++) {
    const curDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const key = `${curDate.getFullYear()}-${curDate.getMonth()}-${curDate.getDate()}`;
    const dayLogs = dayLogsMap.get(key) || [];
    const log = dayLogs[0];

    const dateIso = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, "0")}-${String(curDate.getDate()).padStart(2, "0")}`;
    const contentDangers = (contentJson?.danger_signs || contentJson?.dangers || []).filter((d: any) => d.date === dateIso);
    const contentRecorded = (contentJson?.recorded_symptoms || contentJson?.general_symptoms || contentJson?.symptoms || []).filter((s: any) => s.date === dateIso);
    const contentSymptoms = [...contentDangers, ...contentRecorded];
    const contentObservations = contentJson?.supplement_observations?.filter((o: any) => o.date === dateIso) ?? [];
    const contentFoods = contentJson?.food_logs?.filter((f: any) => f.date === dateIso) ?? [];

    const recorded = Boolean(
      dayLogs.length > 0 ||
      contentSymptoms.length > 0 ||
      contentObservations.length > 0 ||
      contentFoods.length > 0,
    );

    const symptoms: { name: string; severity: Severity }[] = [];

    // Symptoms from all logs on this day (voice extracted text and danger signs)
    if (dayLogs.length > 0) {
      for (const dLog of dayLogs) {
        if (dLog.dangerSigns && Array.isArray(dLog.dangerSigns)) {
          dLog.dangerSigns.forEach((ds: any) => {
            const raw = (ds.name || ds.name_am || ds.detail || "Danger sign").trim();
            if (raw && !symptoms.some((sym) => sym.name === raw)) {
              symptoms.push({ name: raw, severity: 3 });
            }
          });
        }
        if (dLog.symptoms && Array.isArray(dLog.symptoms)) {
          dLog.symptoms.forEach((s: any) => {
            const raw = (s.category_display_en || s.raw_text || s.category || "").trim();
            if (raw && raw.toLowerCase() !== "no symptoms reported. feeling well." && raw.toLowerCase() !== "no symptoms") {
              const sevStr = String(s.severity || "").toLowerCase();
              const sev: Severity =
                sevStr === "severe" || sevStr === "critical" || s.danger_sign ? 3 : sevStr === "moderate" ? 2 : 1;
              if (!symptoms.some((sym) => sym.name === raw)) {
                symptoms.push({ name: raw, severity: sev });
              }
            }
          });
        }
      }
    }

    // Symptoms from backend contentJson
    if (contentSymptoms.length > 0) {
      for (const s of contentSymptoms) {
        const raw = (s.category_display || s.category_display_en || s.raw_text || s.category || "").trim();
        if (raw && raw.toLowerCase() !== "no symptoms reported. feeling well." && raw.toLowerCase() !== "no symptoms") {
          const sevStr = String(s.severity || "").toLowerCase();
          const sev: Severity =
            sevStr === "severe" || sevStr === "critical" || s.assessment === "recognized_danger_category"
              ? 3
              : sevStr === "moderate"
                ? 2
                : 1;
          const canKey = getCanonicalDangerKey({
            category: s.category,
            name: s.category_display_en || s.raw_text,
            name_am: s.category_display || s.raw_text,
          });
          const alreadyHasSameDanger = symptoms.some((sym) => {
            if (sym.name === raw) return true;
            const existingKey = getCanonicalDangerKey({ name: sym.name });
            return existingKey && existingKey !== "unknown_danger" && existingKey === canKey;
          });
          if (!alreadyHasSameDanger) {
            symptoms.push({ name: raw, severity: sev });
          }
        }
      }
    }

    // Food groups detection (strictly from actual records - no dummy staples)
    const foodGroupsSet = new Set<number>();

    // 1. Check backend food logs for this day
    if (contentFoods.length > 0) {
      for (const cf of contentFoods) {
        if (Array.isArray(cf.groups)) {
          cf.groups.forEach((g: unknown) => {
            if (typeof g === "number" && g >= 0 && g <= 4) foodGroupsSet.add(g);
          });
        }
      }
    }

    // 2. Check check-in log entry
    if (log?.entries) {
      const foodEntry = log.entries[1];
      if (foodEntry && foodEntry.answer && !foodEntry.skipped) {
        const txt = String(foodEntry.answer).toLowerCase();
        if (txt.match(/grain|bread|injera|teff|rice|wheat|oats|pasta|barley|ዳቦ|እንጀራ|ሩዝ|ስንዴ/)) {
          foodGroupsSet.add(0);
          const item = txt.match(/injera|እንጀራ/) ? "Injera" : txt.match(/bread|ዳቦ/) ? "Bread" : txt.match(/rice|ሩዝ/) ? "Rice" : "Grains";
          foodItemCounts.Grains.set(item, (foodItemCounts.Grains.get(item) ?? 0) + 1);
        }
        if (txt.match(/protein|meat|beef|chicken|egg|fish|shiro|misir|lentil|bean|chickpea|ስጋ|እንቁላል|ሽሮ|ምስር/)) {
          foodGroupsSet.add(1);
          const item = txt.match(/shiro|ሽሮ/) ? "Shiro" : txt.match(/misir|lentil|ምስር/) ? "Lentils" : txt.match(/egg|እንቁላል/) ? "Eggs" : txt.match(/meat|beef|chicken|ስጋ/) ? "Meat" : "Protein";
          foodItemCounts.Protein.set(item, (foodItemCounts.Protein.get(item) ?? 0) + 1);
        }
        if (txt.match(/dairy|milk|cheese|ayib|yogurt|ወተት|አይብ/)) {
          foodGroupsSet.add(2);
          const item = txt.match(/milk|ወተት/) ? "Milk" : txt.match(/ayib|cheese|አይብ/) ? "Ayib (Cheese)" : "Dairy";
          foodItemCounts.Dairy.set(item, (foodItemCounts.Dairy.get(item) ?? 0) + 1);
        }
        if (txt.match(/fruit|banana|orange|apple|mango|papaya|avocado|lemon|ሙዝ|ብርቱካን|አፕል|ማንጎ|አቮካዶ/)) {
          foodGroupsSet.add(3);
          const item = txt.match(/banana|ሙዝ/) ? "Banana" : txt.match(/mango|ማንጎ/) ? "Mango" : txt.match(/orange|ብርቱካን/) ? "Orange" : txt.match(/avocado|አቮካዶ/) ? "Avocado" : "Fruit";
          foodItemCounts.Fruit.set(item, (foodItemCounts.Fruit.get(item) ?? 0) + 1);
        }
        if (txt.match(/veg|greens|gomen|tomato|salad|carrot|cabbage|onion|potato|pepper|ጎመን|ቲማቲም|ሰላጣ/)) {
          foodGroupsSet.add(4);
          const item = txt.match(/gomen|greens|ጎመን/) ? "Gomen" : txt.match(/tomato|ቲማቲም/) ? "Tomato" : txt.match(/salad|ሰላጣ/) ? "Salad" : "Vegetables";
          foodItemCounts.Veg.set(item, (foodItemCounts.Veg.get(item) ?? 0) + 1);
        }
      }
    }

    // 3. Check backend contentJson.food_logs
    if (contentJson?.food_logs && Array.isArray(contentJson.food_logs)) {
      const match = contentJson.food_logs.find((f: any) => f.date === dateIso);
      if (match) {
        if (Array.isArray(match.food_groups)) {
          match.food_groups.forEach((fg: string) => {
            const normalized = String(fg).toLowerCase();
            if (normalized.includes("grain")) foodGroupsSet.add(0);
            if (normalized.includes("protein")) foodGroupsSet.add(1);
            if (normalized.includes("dairy")) foodGroupsSet.add(2);
            if (normalized.includes("fruit")) foodGroupsSet.add(3);
            if (normalized.includes("veg")) foodGroupsSet.add(4);
          });
        }
        if (Array.isArray(match.items)) {
          match.items.forEach((it: string) => {
            const raw = String(it).toLowerCase();
            if (raw.match(/injera|bread|rice|grain|teff/)) foodItemCounts.Grains.set(it, (foodItemCounts.Grains.get(it) ?? 0) + 1);
            else if (raw.match(/shiro|misir|meat|egg|protein/)) foodItemCounts.Protein.set(it, (foodItemCounts.Protein.get(it) ?? 0) + 1);
            else if (raw.match(/milk|dairy|cheese/)) foodItemCounts.Dairy.set(it, (foodItemCounts.Dairy.get(it) ?? 0) + 1);
            else if (raw.match(/fruit|banana|orange|mango/)) foodItemCounts.Fruit.set(it, (foodItemCounts.Fruit.get(it) ?? 0) + 1);
            else if (raw.match(/veg|gomen|salad|tomato/)) foodItemCounts.Veg.set(it, (foodItemCounts.Veg.get(it) ?? 0) + 1);
          });
        }
      }
    }

    // Supplement adherence detection for this day across all observations and checkin logs
    let supplementTaken: boolean | null = null;
    const dayObs = (contentJson?.supplement_observations && Array.isArray(contentJson.supplement_observations))
      ? contentJson.supplement_observations.filter((o: any) => o.date === dateIso)
      : [];

    if (dayObs.some((o: any) => o.taken_today === true)) {
      supplementTaken = true;
    } else if (dayObs.some((o: any) => o.taken_today === false)) {
      supplementTaken = false;
    }

    if (dayLogs.length > 0) {
      for (const dLog of dayLogs) {
        if (dLog.supplement_check && Array.isArray(dLog.supplement_check)) {
          if (dLog.supplement_check.some((s: any) => s.taken === true || s.taken_today === true)) {
            supplementTaken = true;
            break;
          } else if (supplementTaken === null && dLog.supplement_check.some((s: any) => s.taken === false || s.taken_today === false)) {
            supplementTaken = false;
          }
        }
        if (dLog.entries) {
          const supEntry = findSupplementEntry(dLog.entries);
          if (supEntry) {
            if (supEntry.skipped) {
              if (supplementTaken === null) supplementTaken = false;
            } else {
              const val = evaluateSupplementAnswer(
                `${supEntry.answer || ""} ${supEntry.answer_am || ""}`,
                "supplement",
                "supplement",
              );
              if (val === true) {
                supplementTaken = true;
                break;
              } else if (supplementTaken === null && val === false) {
                supplementTaken = false;
              }
            }
          }
        }
      }
    }

    days.push({
      date: curDate,
      day: i + 1,
      recorded,
      symptoms,
      foodGroups: Array.from(foodGroupsSet),
      supplement: Boolean(supplementTaken),
    });
  }

  const recordedDays = days.filter((d) => d.recorded).length;
  const totalDays = days.length;
  const daysMissed = totalDays - recordedDays;
  const checkinRate = totalDays > 0 ? Math.round((recordedDays / totalDays) * 100) : 0;
  const daysWithSymptoms = days.filter((d) => d.symptoms.length > 0).length;
  const foodCoverageDays = days.filter((d) => d.foodGroups.length >= 4).length;

  const totalFoodScore = days.reduce((sum, d) => sum + (d.recorded ? d.foodGroups.length : 0), 0);
  const avgFoodGroups =
    recordedDays > 0 ? Math.round((totalFoodScore / recordedDays) * 10) / 10 : 0;

  const foodCounts = [0, 1, 2, 3, 4].map(
    (idx) => days.filter((d) => d.foodGroups.includes(idx)).length,
  );

  const itemsByGroup: Record<string, { name: string; times: number }[]> = {
    Grains: Array.from(foodItemCounts.Grains.entries()).map(([name, times]) => ({ name, times })).sort((a, b) => b.times - a.times),
    Protein: Array.from(foodItemCounts.Protein.entries()).map(([name, times]) => ({ name, times })).sort((a, b) => b.times - a.times),
    Dairy: Array.from(foodItemCounts.Dairy.entries()).map(([name, times]) => ({ name, times })).sort((a, b) => b.times - a.times),
    Fruit: Array.from(foodItemCounts.Fruit.entries()).map(([name, times]) => ({ name, times })).sort((a, b) => b.times - a.times),
    Veg: Array.from(foodItemCounts.Veg.entries()).map(([name, times]) => ({ name, times })).sort((a, b) => b.times - a.times),
  };

  // Symptom aggregation
  const symptomMap = new Map<string, { count: number; sum: number }>();
  for (const day of days) {
    for (const s of day.symptoms) {
      const name = String(s.name).replace(/^reports\.symptomsMap\./, "").trim();
      if (!name) continue;
      const existing = symptomMap.get(name) ?? { count: 0, sum: 0 };
      existing.count += 1;
      existing.sum += s.severity;
      symptomMap.set(name, existing);
    }
  }

  const symptomTotals = Array.from(symptomMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      avg: Math.round((data.sum / data.count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);

  const topSymptoms = symptomTotals.slice(0, 4);
  const leading = topSymptoms[0] ?? null;

  // Supplement adherence calculation:
  const activeSupplements: Array<{ id: string; name: string }> =
    activeSupplementsFromBackend.length > 0
      ? activeSupplementsFromBackend
      : [
          { id: "iron-and-folic-acid-ifa", name: "Iron & Folic Acid (IFA)" },
          { id: "calcium-supplement", name: "Calcium Supplement" },
        ];

  const computeLogEntriesForSupplement = (sup: { id: string; name: string }) => {
    const entries = days.map((d) => {
      if (!d.recorded) return { day: d.day, taken: null };
      const key = `${d.date.getFullYear()}-${d.date.getMonth()}-${d.date.getDate()}`;
      const dateIso = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, "0")}-${String(d.date.getDate()).padStart(2, "0")}`;
      const isToday = d.date.toDateString() === new Date().toDateString();
      const dayLogs = dayLogsMap.get(key) || [];

      let isTaken: boolean | null = null;

      // 1. Check contentJson.supplement_observations for this date and supplement
      if (contentJson?.supplement_observations && Array.isArray(contentJson.supplement_observations)) {
        const matchingObs = contentJson.supplement_observations.filter(
          (o: any) =>
            o.date === dateIso &&
            (matchesSupplement(o.supplement_name || "", sup.name) ||
              matchesSupplement(o.supplement_name || "", sup.id)),
        );
        if (matchingObs.some((o: any) => o.taken_today === true)) {
          isTaken = true;
        } else if (matchingObs.some((o: any) => o.taken_today === false)) {
          isTaken = false;
        }
      }

      // 2. Check all checkin logs for this date
      if (dayLogs.length > 0) {
        for (const log of dayLogs) {
          if (log.supplement_check && Array.isArray(log.supplement_check)) {
            const sc = log.supplement_check.find(
              (item: any) =>
                matchesSupplement(item.name || item.supplement_name || "", sup.name) ||
                matchesSupplement(item.name || item.supplement_name || "", sup.id),
            );
            if (sc) {
              if (sc.taken === true || sc.taken_today === true) {
                isTaken = true;
                break;
              } else if (isTaken === null && (sc.taken === false || sc.taken_today === false)) {
                isTaken = false;
              }
            }
          }

          if (log.entries) {
            const supEntry = findSupplementEntry(log.entries);
            if (supEntry) {
              if (supEntry.skipped && supEntry.answer && /skipped|ተዘሏል/i.test(supEntry.answer)) {
                if (isTaken === null) isTaken = false;
              } else if (supEntry.answer && !supEntry.answer.includes("No supplement check recorded")) {
                const val = evaluateSupplementAnswer(
                  `${supEntry.answer || ""} ${supEntry.answer_am || ""}`,
                  sup.id,
                  sup.name,
                );
                if (val === true) {
                  isTaken = true;
                  break;
                } else if (isTaken === null && val === false) {
                  isTaken = false;
                }
              }
            }
          }
        }
      }

      return { day: d.day, taken: isTaken };
    });

    const takenDays = entries.filter((e) => e.taken === true).length;
    const missedDays = entries.filter((e) => e.taken === false).length;
    const loggedDays = takenDays + missedDays;
    const percent = loggedDays > 0 ? Math.round((takenDays / loggedDays) * 100) : null;

    return {
      id: sup.id,
      name: canonicalSupplementName(sup.name),
      entries,
      takenDays,
      missedDays,
      loggedDays,
      unloggedDays: entries.length - loggedDays,
      percent,
    };
  };

  const backendAdherence = contentJson?.supplement_adherence;
  const supplementReports: SupplementReport[] = activeSupplements.map((sup: { id: string; name: string }) => {
    const computed = computeLogEntriesForSupplement(sup);
    if (backendAdherence?.by_supplement) {
      const match = backendAdherence.by_supplement.find(
        (b: any) =>
          matchesSupplement(b.supplement_name || "", sup.name) ||
          matchesSupplement(b.supplement_name || "", sup.id),
      );
      if (match && Number(match.tracked_days ?? 0) > 0) {
        const backendTaken = Number(match.taken_days ?? 0);
        const backendMissed = Number(match.not_taken_days ?? 0);
        const backendLogged = Number(match.tracked_days ?? (backendTaken + backendMissed));

        const taken = Math.max(computed.takenDays, backendTaken);
        const missed = Math.max(computed.missedDays, backendMissed);
        const logged = taken + missed;
        const pct = logged > 0 ? Math.round((taken / logged) * 100) : null;
        return {
          ...computed,
          takenDays: taken,
          missedDays: missed,
          loggedDays: logged,
          unloggedDays: Math.max(0, computed.entries.length - logged),
          percent: pct,
        };
      }
    }
    return computed;
  });

  // Calendar cells with lead padding for Monday start
  const firstDay = days[0].date;
  const leadPadding = (firstDay.getDay() + 6) % 7;
  const calendarCells = [
    ...Array.from({ length: leadPadding }, () => null),
    ...days,
  ];

  return {
    hasData: recordedDays > 0,
    days,
    calendarCells,
    totalDays,
    recordedDays,
    daysMissed,
    checkinRate,
    daysWithSymptoms,
    symptomTotals,
    topSymptoms,
    leading,
    foodCounts,
    avgFoodGroups,
    foodCoverageDays,
    itemsByGroup,
    supplementReports,
    periodLabel: rangeLabel || "14-Day ANC Window",
  };
}
