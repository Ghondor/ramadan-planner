export const QURAN_PAGES = 604;
export const RAMADAN_DAYS = 30;

export function pagesPerDayForKhatmah(k: "1" | "2" | "3"): number {
  return Math.ceil((QURAN_PAGES * Number(k)) / RAMADAN_DAYS);
}

export function totalPagesForKhatmah(k: "1" | "2" | "3"): number {
  return QURAN_PAGES * Number(k);
}
