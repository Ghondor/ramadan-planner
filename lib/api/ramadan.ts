const BASE_URL = "https://api.aladhan.com/v1";

export interface RamadanDay {
  date: {
    readable: string;
    gregorian: { date: string; day: string; month: { number: number; en: string }; year: string };
    hijri: {
      date: string;
      day: string;
      month: { number: number; en: string; ar: string };
      year: string;
    };
  };
}

export interface RamadanCalendarResponse {
  code: number;
  status: string;
  data: RamadanDay[];
}

export async function fetchRamadanCalendar(
  year: number,
  lat: number,
  lng: number,
  method: number = 3,
  school: number = 0
): Promise<RamadanCalendarResponse> {
  const res = await fetch(
    `${BASE_URL}/hijriCalendar/${9}/${year}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
  );
  if (!res.ok) throw new Error("Failed to fetch Ramadan calendar");
  return res.json();
}

export function getRamadanDates(year: number): { start: string; end: string } {
  const dateMap: Record<number, { start: string; end: string }> = {
    1447: { start: "2026-02-17", end: "2026-03-19" },
    1448: { start: "2027-02-07", end: "2027-03-08" },
  };
  return dateMap[year] || { start: "2026-02-17", end: "2026-03-19" };
}

export function getDaysInRamadan(): number {
  return 30;
}
