"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useCurrentPlanner } from "@/lib/hooks/use-planner";
import { useAllProgress } from "@/lib/hooks/use-daily-progress";
import { useMode } from "@/lib/context/mode-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

function getCompletionPercent(entry: {
  salah_status: { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean; taraweeh: boolean };
  quran_pages: number;
  habits: Record<string, boolean>;
  fasting: boolean;
}): number {
  const s = entry.salah_status;
  const salahDone = [s.fajr, s.dhuhr, s.asr, s.maghrib, s.isha, s.taraweeh].filter(Boolean).length;
  const salahTotal = 6;
  const habitsDone = Object.values(entry.habits).filter(Boolean).length;
  const habitsTotal = Math.max(Object.keys(entry.habits).length, 1);
  const quranDone = entry.quran_pages > 0 ? 1 : 0;
  const fastingDone = entry.fasting ? 1 : 0;

  const total = salahTotal + habitsTotal + 1 + 1;
  const done = salahDone + habitsDone + quranDone + fastingDone;
  return Math.round((done / total) * 100);
}

function getColorForPercent(percent: number): string {
  if (percent >= 80) return "bg-emerald-500 dark:bg-emerald-400";
  if (percent >= 50) return "bg-amber-400 dark:bg-amber-500";
  if (percent > 0) return "bg-red-400 dark:bg-red-500";
  return "bg-muted";
}

function getTextColorForPercent(percent: number): string {
  if (percent >= 80) return "text-emerald-700 dark:text-emerald-300";
  if (percent >= 50) return "text-amber-700 dark:text-amber-400";
  if (percent > 0) return "text-red-700 dark:text-red-400";
  return "text-muted-foreground";
}

export default function CalendarPage() {
  const { mode } = useMode();
  const { data: planner, isLoading: plannerLoading } = useCurrentPlanner();
  const { data: allProgress, isLoading: progressLoading } = useAllProgress(
    planner?.id ?? null
  );
  const t = useTranslations("calendar");
  const tc = useTranslations("common");

  const days = useMemo(() => {
    if (!planner) return [];
    const start = new Date(planner.start_date);
    const result = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const progress = allProgress?.find((p) => p.gregorian_date === dateStr);
      const percent = progress ? getCompletionPercent(progress) : 0;
      result.push({ day: i + 1, date: dateStr, percent, hasData: !!progress });
    }
    return result;
  }, [planner, allProgress]);

  const isLoading = plannerLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!planner) {
    return (
      <div className="p-4 max-w-lg mx-auto text-center space-y-4 pt-20">
        <Moon className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-bold">{tc("noPlanner")}</h2>
        <p className="text-muted-foreground">{t("noPlanner")}</p>
        <Button asChild>
          <Link href="/onboarding">{tc("setupPlanner")}</Link>
        </Button>
      </div>
    );
  }

  const totalPercent = days.length
    ? Math.round(days.reduce((sum, d) => sum + d.percent, 0) / days.length)
    : 0;

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {t("title")}
        </h1>
        <span className="text-sm text-muted-foreground">
          {planner.year_hijri} {tc("ah")}
        </span>
      </div>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex justify-between items-center text-sm">
            <span>{t("overallCompletion")}</span>
            <span className="font-bold">{totalPercent}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("thirtyDayGrid")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {days.map((day) => {
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
              const isToday = day.date === todayStr;

              return (
                <Link
                  key={day.day}
                  href={`/dashboard/daily/${day.date}`}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:scale-105 hover:shadow-sm ${
                    isToday
                      ? "border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800"
                      : "border-border"
                  }`}
                >
                  <span className="text-xs font-medium">{day.day}</span>
                  {day.hasData ? (
                    <div
                      className={`mt-1 h-1.5 w-full rounded-full ${getColorForPercent(day.percent)}`}
                    />
                  ) : (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted" />
                  )}
                  {day.hasData && (
                    <span
                      className={`text-[9px] mt-0.5 ${getTextColorForPercent(day.percent)}`}
                    >
                      {day.percent}%
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{t("legendHigh")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <span>{t("legendMid")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <span>{t("legendLow")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-muted border" />
          <span>{t("legendNone")}</span>
        </div>
      </div>
    </div>
  );
}
