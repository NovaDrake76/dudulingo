/**
 * Turn raw review_events timestamps into the numbers the UI needs:
 * a 14-week heatmap grid, a current streak, and simple accuracy history.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function localMidnight(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function addDays(ts: number, days: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export type ActivityEvent = { reviewed_at: number; rating?: string | null };

export function countsByDay(events: ActivityEvent[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const e of events) {
    const key = localMidnight(e.reviewed_at);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

/**
 * 14 columns × 7 rows grid, rightmost column = the week that contains "today".
 * Rows follow a Sunday-first calendar (row 0 = Sunday, row 6 = Saturday) and
 * cells for dates in the future (later this week) are left empty.
 */
export function buildHeatmap(
  events: ActivityEvent[],
  weeks = 14,
  today: number = Date.now(),
): number[] {
  const counts = countsByDay(events);
  const todayMidnight = localMidnight(today);
  const todayDow = new Date(todayMidnight).getDay(); // 0..6, Sun..Sat
  const lastColStart = addDays(todayMidnight, -todayDow); // Sunday of this week

  const out: number[] = new Array(weeks * 7).fill(0);
  for (let w = 0; w < weeks; w++) {
    const weekStart = addDays(lastColStart, -(weeks - 1 - w) * 7);
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d);
      if (day > todayMidnight) continue; // future → stays 0
      const n = counts.get(day) ?? 0;
      out[w * 7 + d] = intensityFor(n);
    }
  }
  return out;
}

export function intensityFor(n: number): number {
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  return 3;
}

/**
 * Longest run of consecutive days with activity that includes today
 * (or yesterday — a fresh day that hasn't reviewed yet shouldn't reset
 * a streak mid-morning).
 */
export function currentStreak(events: ActivityEvent[], today: number = Date.now()): number {
  if (events.length === 0) return 0;
  const counts = countsByDay(events);
  const todayMidnight = localMidnight(today);
  const yesterday = todayMidnight - DAY_MS;

  let cursor: number;
  if (counts.has(todayMidnight)) cursor = todayMidnight;
  else if (counts.has(yesterday)) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (counts.has(cursor)) {
    streak++;
    cursor -= DAY_MS;
    cursor = localMidnight(cursor); // normalize across DST
  }
  return streak;
}

export function windowSinceMs(days: number, today: number = Date.now()): number {
  return addDays(localMidnight(today), -(days - 1));
}

/**
 * Median seconds the user actually spends per card, estimated from
 * gaps between consecutive review events within the same session.
 * Returns null when we don't have enough data to be truthful.
 */
export function medianSecondsPerCard(events: ActivityEvent[]): number | null {
  if (events.length < 5) return null;
  const sorted = [...events].sort((a, b) => a.reviewed_at - b.reviewed_at);
  const gaps: number[] = [];
  const SESSION_BREAK = 5 * 60 * 1000; // gaps larger than 5 min aren't card-level
  for (let i = 1; i < sorted.length; i++) {
    const g = sorted[i].reviewed_at - sorted[i - 1].reviewed_at;
    if (g > 0 && g <= SESSION_BREAK) gaps.push(g);
  }
  if (gaps.length < 4) return null;
  gaps.sort((a, b) => a - b);
  const mid = Math.floor(gaps.length / 2);
  const median = gaps.length % 2 === 0 ? (gaps[mid - 1] + gaps[mid]) / 2 : gaps[mid];
  return Math.round(median / 1000);
}

/**
 * "Next rung" target from a ladder of meaningful thresholds. Used so the
 * milestone bars always have a nearby goal instead of a hardcoded number.
 */
export function nextMilestone(current: number, ladder: number[]): number {
  for (const rung of ladder) {
    if (rung > current) return rung;
  }
  return ladder[ladder.length - 1];
}

export const MILESTONE_LADDERS = {
  words: [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  streak: [3, 7, 14, 30, 60, 100, 180, 365],
};
