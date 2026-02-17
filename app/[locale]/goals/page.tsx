"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCurrentPlanner } from "@/lib/hooks/use-planner";
import { useAllProgress } from "@/lib/hooks/use-daily-progress";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  BookOpen,
  Plus,
  X,
  Save,
  Loader2,
  Check,
  Moon,
} from "lucide-react";
import type { QuranGoalType } from "@/lib/types/database";
import {
  QURAN_PAGES,
  RAMADAN_DAYS,
  pagesPerDayForKhatmah,
  totalPagesForKhatmah,
} from "@/lib/quran";

export default function GoalsPage() {
  const t = useTranslations("goals");
  const tc = useTranslations("common");
  const { data: planner, isLoading } = useCurrentPlanner();
  const { data: allProgress } = useAllProgress(planner?.id ?? null);
  const queryClient = useQueryClient();

  const [quranGoalType, setQuranGoalType] = useState<QuranGoalType>("1");
  const [quranGoal, setQuranGoal] = useState(5);
  const [habits, setHabits] = useState<string[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (planner?.goals) {
      const type = planner.goals.quran_goal_type ?? "custom";
      const pages = planner.goals.quran_pages_per_day;
      setQuranGoalType(type);
      setQuranGoal(pages);
      setHabits(planner.goals.habits);
    }
  }, [planner]);

  const addHabit = () => {
    const trimmed = newHabit.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !habits.includes(trimmed)) {
      setHabits([...habits, trimmed]);
      setNewHabit("");
    }
  };

  const removeHabit = (habit: string) => {
    setHabits(habits.filter((h) => h !== habit));
  };

  const effectivePagesPerDay =
    quranGoalType === "custom"
      ? quranGoal
      : pagesPerDayForKhatmah(quranGoalType as "1" | "2" | "3");
  const quranTarget =
    quranGoalType === "custom"
      ? quranGoal * RAMADAN_DAYS
      : totalPagesForKhatmah(quranGoalType as "1" | "2" | "3");

  const handleSave = async () => {
    if (!planner) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("planners")
      .update({
        goals: {
          quran_pages_per_day: effectivePagesPerDay,
          quran_goal_type: quranGoalType,
          habits,
        },
      })
      .eq("id", planner.id);

    queryClient.invalidateQueries({ queryKey: ["current-planner"] });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Compute actuals
  const totalQuranPages =
    allProgress?.reduce((sum, p) => sum + p.quran_pages, 0) ?? 0;
  const daysLogged = allProgress?.length ?? 0;
  const avgQuranPages = daysLogged > 0 ? Math.round(totalQuranPages / daysLogged) : 0;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
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

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Target className="h-5 w-5" />
        {t("title")}
      </h1>

      {/* Quran Goal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("quranGoal")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("quranGoalType")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["1", "2", "3"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setQuranGoalType(k)}
                  className={`flex flex-col items-center gap-0.5 p-3 rounded-lg border-2 transition-all ${
                    quranGoalType === k
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-border hover:border-emerald-200"
                  }`}
                >
                  <span className="text-sm font-semibold">{t(`khatmah${k}`)}</span>
                  <span className="text-xs text-muted-foreground">
                    {pagesPerDayForKhatmah(k)} {t("pagesPerDayShort")}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setQuranGoalType("custom")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  quranGoalType === "custom"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-border hover:border-emerald-200"
                }`}
              >
                <span className="text-sm font-semibold">{t("custom")}</span>
              </button>
            </div>
          </div>

          {quranGoalType === "custom" && (
            <>
              <div className="flex justify-between text-sm">
                <span>{t("dailyTarget")}</span>
                <span className="font-bold">{tc("pagesPerDay", { count: quranGoal })}</span>
              </div>
              <Slider
                value={[quranGoal]}
                onValueChange={([v]) => setQuranGoal(v)}
                min={1}
                max={60}
                step={1}
              />
            </>
          )}

          <div className="flex justify-between text-sm">
            <span>{t("dailyTarget")}</span>
            <span className="font-bold">{tc("pagesPerDay", { count: effectivePagesPerDay })}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {quranGoalType !== "custom" && effectivePagesPerDay >= pagesPerDayForKhatmah("1")
              ? t("completeQuran")
              : t("pagesIn30Days", {
                  pages: quranTarget,
                  days: Math.ceil(QURAN_PAGES / effectivePagesPerDay),
                })}
          </p>

          <Separator />

          {/* Progress comparison */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("totalPagesRead")}</span>
              <span className="font-medium">
                {totalQuranPages} / {quranTarget}
              </span>
            </div>
            <Progress
              value={quranTarget > 0 ? (totalQuranPages / quranTarget) * 100 : 0}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {t("avgPages", { count: avgQuranPages })}
              {avgQuranPages >= effectivePagesPerDay
                ? t("onTrack")
                : t("keepPushing")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Habits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("dailyHabits")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {habits.length > 0 ? (
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm capitalize">
                    {habit.replace(/-/g, " ")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeHabit(habit)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("noHabitsYet")}
            </p>
          )}

          <div className="flex gap-2">
            <Input
              placeholder={t("addHabit")}
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              className="flex-1"
            />
            <Button
              onClick={addHabit}
              size="icon"
              variant="outline"
              disabled={!newHabit.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
        size="lg"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {tc("saving")}
          </>
        ) : saved ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            {tc("saved")}
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            {t("saveGoals")}
          </>
        )}
      </Button>
    </div>
  );
}
