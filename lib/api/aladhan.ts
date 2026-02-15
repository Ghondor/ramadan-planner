const BASE_URL = "https://api.aladhan.com/v1";

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  date: string;
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
}

export interface AladhanTimingsResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimings;
    date: {
      readable: string;
      gregorian: { date: string };
      hijri: HijriDate;
    };
  };
}

export interface AladhanCalendarResponse {
  code: number;
  status: string;
  data: Array<{
    timings: PrayerTimings;
    date: {
      readable: string;
      gregorian: { date: string; day: string; month: { number: number } };
      hijri: HijriDate;
    };
  }>;
}

export async function fetchPrayerTimes(
  lat: number,
  lng: number,
  date: string,
  method: number = 3,
  school: number = 0
): Promise<AladhanTimingsResponse> {
  const res = await fetch(
    `${BASE_URL}/timings/${date}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
  );
  if (!res.ok) throw new Error("Failed to fetch prayer times");
  return res.json();
}

export async function fetchMonthlyCalendar(
  lat: number,
  lng: number,
  month: number,
  year: number,
  method: number = 3,
  school: number = 0
): Promise<AladhanCalendarResponse> {
  const res = await fetch(
    `${BASE_URL}/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
  );
  if (!res.ok) throw new Error("Failed to fetch monthly calendar");
  return res.json();
}

export async function fetchHijriDate(
  date: string
): Promise<{ data: { hijri: HijriDate } }> {
  const res = await fetch(`${BASE_URL}/gpidays/${date}`);
  if (!res.ok) {
    const fallback = await fetch(`${BASE_URL}/gToH/${date}`);
    if (!fallback.ok) throw new Error("Failed to fetch Hijri date");
    return fallback.json();
  }
  return res.json();
}

export function getMadhabSchool(madhab: string): number {
  return madhab === "hanafi" ? 1 : 0;
}
