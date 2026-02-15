"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPrayerTimes, getMadhabSchool } from "@/lib/api/aladhan";
import type { Location, Madhab } from "@/lib/types/database";

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function usePrayerTimes(
  location: Location | null,
  madhab: Madhab = "hanafi",
  date?: Date
) {
  const targetDate = date || new Date();
  const dateStr = formatDate(targetDate);

  return useQuery({
    queryKey: ["prayer-times", location?.lat, location?.lng, madhab, dateStr],
    queryFn: async () => {
      if (!location) throw new Error("No location set");
      const res = await fetchPrayerTimes(
        location.lat,
        location.lng,
        dateStr,
        3,
        getMadhabSchool(madhab)
      );
      return res.data;
    },
    enabled: !!location,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
