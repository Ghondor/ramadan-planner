"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import type { PrayerTimings } from "@/lib/api/aladhan";

const PRAYER_NAMES: (keyof PrayerTimings)[] = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

function getNextPrayer(timings: PrayerTimings): string | null {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const prayer of PRAYER_NAMES) {
    if (prayer === "Sunrise") continue;
    const [h, m] = timings[prayer].split(":").map(Number);
    if (h * 60 + m > currentTime) return prayer;
  }
  return null;
}

interface PrayerCardProps {
  timings: PrayerTimings | undefined;
  isLoading: boolean;
}

export function PrayerCard({ timings, isLoading }: PrayerCardProps) {
  const nextPrayer = timings ? getNextPrayer(timings) : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Prayer Times
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : timings ? (
          <div className="space-y-2">
            {PRAYER_NAMES.map((prayer) => (
              <div
                key={prayer}
                className={`flex justify-between items-center py-1.5 px-2 rounded-lg text-sm ${
                  nextPrayer === prayer
                    ? "bg-emerald-50 dark:bg-emerald-950/30 font-semibold text-emerald-700 dark:text-emerald-300"
                    : ""
                }`}
              >
                <span>{prayer}</span>
                <span className="tabular-nums font-mono text-xs">
                  {timings[prayer]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Set your location to see prayer times
          </p>
        )}
      </CardContent>
    </Card>
  );
}
