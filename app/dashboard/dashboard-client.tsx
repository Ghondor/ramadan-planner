"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/hooks/use-profile";
import { useCurrentPlanner } from "@/lib/hooks/use-planner";
import { usePrayerTimes } from "@/lib/hooks/use-prayer-times";
import { useDailyProgress, useAllProgress, useUpsertDailyProgress } from "@/lib/hooks/use-daily-progress";
import { useMode } from "@/lib/context/mode-context";
import { PrayerCard } from "@/components/prayer-card";
import { StreakCounter, calculateStreak } from "@/components/streak-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronRight,
  Moon,
  Sparkles,
  Star,
} from "lucide-react";
import type { SalahStatus } from "@/lib/types/database";

const SALAH_NAMES: (keyof SalahStatus)[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
  "taraweeh",
];
const SALAH_LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  taraweeh: "Taraweeh",
};

export default function DashboardClient() {
  const [today] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const { mode } = useMode();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: planner, isLoading: plannerLoading } = useCurrentPlanner();
  const { data: prayerData, isLoading: prayerLoading } = usePrayerTimes(
    profile?.location ?? null,
    profile?.madhab
  );
  const { data: todayProgress } = useDailyProgress(planner?.id ?? null, today);
  const { data: allProgress } = useAllProgress(planner?.id ?? null);
  const upsertProgress = useUpsertDailyProgress();

  const [salah, setSalah] = useState<SalahStatus>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    taraweeh: false,
  });

  useEffect(() => {
    if (todayProgress) {
      setSalah(todayProgress.salah_status);
    }
  }, [todayProgress]);

  const streak = allProgress ? calculateStreak(allProgress) : 0;
  const salahCount = Object.values(salah).filter(Boolean).length;
  const salahTotal = 6;

  const handleSalahToggle = async (prayer: keyof SalahStatus) => {
    if (!planner || !profile) return;
    const updated = { ...salah, [prayer]: !salah[prayer] };
    setSalah(updated);

    upsertProgress.mutate({
      planner_id: planner.id,
      user_id: profile.user_id,
      gregorian_date: today,
      salah_status: updated,
      quran_pages: todayProgress?.quran_pages ?? 0,
      fasting: todayProgress?.fasting ?? true,
      habits: todayProgress?.habits ?? {},
      journal_text: todayProgress?.journal_text ?? "",
    });
  };

  const isLoading = profileLoading || plannerLoading;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!planner) {
    return (
      <div className="p-4 max-w-lg mx-auto text-center space-y-4 pt-20">
        <Moon className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-bold">No Planner Yet</h2>
        <p className="text-muted-foreground">
          Set up your Ramadan planner to get started
        </p>
        <Button asChild>
          <Link href="/onboarding">Set Up Planner</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Assalamu Alaikum</h1>
          <p className="text-sm text-muted-foreground">
            {prayerData?.date?.hijri
              ? `${prayerData.date.hijri.day} ${prayerData.date.hijri.month.en} ${prayerData.date.hijri.year} AH`
              : new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            mode === "spark"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          }`}
        >
          {mode === "spark" ? (
            <Sparkles className="h-3 w-3" />
          ) : (
            <BookOpen className="h-3 w-3" />
          )}
          {mode === "spark" ? "Spark" : "Classic"}
        </div>
      </div>

      {/* Streak */}
      <StreakCounter streak={streak} mode={mode} />

      {/* Spark XP bar */}
      {mode === "spark" && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Daily XP</span>
              <span className="text-muted-foreground">
                {salahCount * 10 + (todayProgress?.quran_pages ?? 0) * 5} XP
              </span>
            </div>
            <Progress
              value={Math.min(
                ((salahCount * 10 + (todayProgress?.quran_pages ?? 0) * 5) /
                  100) *
                  100,
                100
              )}
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Prayer Times */}
      <PrayerCard timings={prayerData?.timings} isLoading={prayerLoading} />

      {/* Quick Check-in */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Today&apos;s Prayers
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {salahCount}/{salahTotal}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {SALAH_NAMES.map((prayer) => (
              <label
                key={prayer}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  salah[prayer]
                    ? "bg-emerald-50 dark:bg-emerald-950/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={salah[prayer]}
                  onCheckedChange={() => handleSalahToggle(prayer)}
                />
                <span
                  className={`text-sm ${
                    salah[prayer]
                      ? "font-medium text-emerald-700 dark:text-emerald-300"
                      : ""
                  }`}
                >
                  {SALAH_LABELS[prayer]}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick link to full daily view */}
      <Button
        asChild
        variant="outline"
        className="w-full justify-between"
        size="lg"
      >
        <Link href={`/dashboard/daily/${today}`}>
          Open Full Daily View
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>

      {/* Motivational */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm italic text-center text-emerald-800 dark:text-emerald-200">
            &quot;The best of you are those who learn the Quran and teach
            it.&quot;
          </p>
          <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 mt-1">
            — Prophet Muhammad (PBUH)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
