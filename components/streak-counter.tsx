"use client";

import { Flame } from "lucide-react";
import type { DailyProgress } from "@/lib/types/database";

export function calculateStreak(progressList: DailyProgress[]): number {
  if (!progressList.length) return 0;

  const sorted = [...progressList].sort(
    (a, b) =>
      new Date(b.gregorian_date).getTime() -
      new Date(a.gregorian_date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const entry of sorted) {
    const entryDate = new Date(entry.gregorian_date);
    entryDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - streak);

    const diff = Math.abs(entryDate.getTime() - expectedDate.getTime());
    if (diff > 86400000) break;

    const salah = entry.salah_status;
    const allPrayed =
      salah.fajr && salah.dhuhr && salah.asr && salah.maghrib && salah.isha;
    if (!allPrayed) break;

    streak++;
  }

  return streak;
}

interface StreakCounterProps {
  streak: number;
  mode: "classic" | "spark";
}

export function StreakCounter({ streak, mode }: StreakCounterProps) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
        mode === "spark"
          ? "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30"
          : "bg-muted/50"
      }`}
    >
      <Flame
        className={`h-6 w-6 ${
          streak > 0
            ? "text-orange-500 animate-pulse"
            : "text-muted-foreground"
        }`}
      />
      <div>
        <p className="text-2xl font-bold tabular-nums">{streak}</p>
        <p className="text-xs text-muted-foreground">Day Streak</p>
      </div>
      {mode === "spark" && streak >= 7 && (
        <span className="ml-auto text-xs font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
          On Fire!
        </span>
      )}
    </div>
  );
}
