const pad = (n: number) => String(n).padStart(2, '0');

export function getTimeGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

/** Local date as the YYYY-MM-DD string an <input type="date"> uses. */
export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Local time as the HH:MM string an <input type="time"> uses. */
export const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long' }).format(date);
}

export function formatShortDateLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', weekday: 'short' }).format(date);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * The nearest upcoming departure slot: "now" rounded up to the next 5 minutes.
 * 14:07 -> 14:10, 14:10 -> 14:15. After 23:55 it rolls over to tomorrow.
 */
export function nextDeparture(now: Date = new Date(), stepMin = 5): { date: string; time: string } {
  const d = new Date(now.getTime());
  d.setSeconds(0, 0);
  const rem = d.getMinutes() % stepMin;
  d.setMinutes(d.getMinutes() + (rem === 0 ? stepMin : stepMin - rem));
  return { date: toDateInput(d), time: toTimeInput(d) };
}

/**
 * Makes sure a chosen departure is not in the past.
 * - A date before today becomes today.
 * - A time earlier than the current minute (today only) moves to the next upcoming slot.
 */
export function clampDeparture(date: string, time: string, now: Date = new Date()): { date: string; time: string } {
  const today = toDateInput(now);
  const nowTime = toTimeInput(now);
  let d = date && date >= today ? date : today;
  let t = time || (d === today ? nowTime : '08:00');
  if (d === today && t < nowTime) {
    const next = nextDeparture(now);
    d = next.date;
    t = next.time;
  }
  return { date: d, time: t };
}