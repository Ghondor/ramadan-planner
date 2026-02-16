"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useProfile } from "@/lib/hooks/use-profile";
import { useCurrentPlanner } from "@/lib/hooks/use-planner";
import { usePrayerTimes } from "@/lib/hooks/use-prayer-times";
import {
  useDailyProgress,
  useUpsertDailyProgress,
} from "@/lib/hooks/use-daily-progress";
import { useMode } from "@/lib/context/mode-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Flame,
  Loader2,
  Utensils,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { SalahStatus } from "@/lib/types/database";

const SALAH_NAMES: (keyof SalahStatus)[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
  "taraweeh",
];

export default function DailyViewClient() {
  const params = useParams();
  const router = useRouter();
  const dateStr = params.date as string;
  const { mode } = useMode();
  const { data: profile } = useProfile();
  const { data: planner } = useCurrentPlanner();
  const { data: prayerData, isLoading: prayerLoading } = usePrayerTimes(
    profile?.location ?? null,
    profile?.madhab,
    new Date(dateStr)
  );
  const { data: progress, isLoading: progressLoading } = useDailyProgress(
    planner?.id ?? null,
    dateStr
  );
  const upsertProgress = useUpsertDailyProgress();
  const t = useTranslations("daily");
  const tc = useTranslations("common");
  const tp = useTranslations("prayers");
  const locale = useLocale();

  const [salah, setSalah] = useState<SalahStatus>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    taraweeh: false,
  });
  const [quranPages, setQuranPages] = useState(0);
  const [fasting, setFasting] = useState(true);
  const [habits, setHabits] = useState<Record<string, boolean>>({});
  const [journal, setJournal] = useState("");
  const [saved, setSaved] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (progress && !initializedRef.current) {
      setSalah(progress.salah_status);
      setQuranPages(progress.quran_pages);
      setFasting(progress.fasting);
      setHabits(progress.habits);
      setJournal(progress.journal_text);
      initializedRef.current = true;
    }
    if (!progressLoading && !progress && !initializedRef.current) {
      if (planner?.goals?.habits) {
        const initial: Record<string, boolean> = {};
        for (const h of planner.goals.habits) {
          initial[h] = false;
        }
        setHabits(initial);
      }
      initializedRef.current = true;
    }
  }, [progress, progressLoading, planner]);

  const saveProgress = useCallback(() => {
    if (!planner || !profile) return;
    upsertProgress.mutate(
      {
        planner_id: planner.id,
        user_id: profile.user_id,
        gregorian_date: dateStr,
        salah_status: salah,
        quran_pages: quranPages,
        fasting,
        habits,
        journal_text: journal,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  }, [planner, profile, dateStr, salah, quranPages, fasting, habits, journal, upsertProgress]);

  const scheduleAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveProgress();
    }, 2000);
  }, [saveProgress]);

  const handleSalahToggle = (prayer: keyof SalahStatus) => {
    setSalah((prev) => ({ ...prev, [prayer]: !prev[prayer] }));
    scheduleAutoSave();
  };

  const handleHabitToggle = (habit: string) => {
    setHabits((prev) => ({ ...prev, [habit]: !prev[habit] }));
    scheduleAutoSave();
  };

  const displayDate = new Date(dateStr).toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hijriDisplay = prayerData?.date?.hijri
    ? `${prayerData.date.hijri.day} ${prayerData.date.hijri.month.en} ${prayerData.date.hijri.year} ${tc("ah")}`
    : "";

  const salahCount = Object.values(salah).filter(Boolean).length;

  if (progressLoading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">{displayDate}</h1>
          {hijriDisplay && (
            <p className="text-sm text-muted-foreground">{hijriDisplay}</p>
          )}
        </div>
      </div>

      {/* Prayer Times + Checkboxes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t("prayers", { count: salahCount })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SALAH_NAMES.map((prayer) => (
            <div
              key={prayer}
              className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                salah[prayer]
                  ? "bg-emerald-50 dark:bg-emerald-950/20"
                  : "hover:bg-muted/50"
              }`}
            >
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <Checkbox
                  checked={salah[prayer]}
                  onCheckedChange={() => handleSalahToggle(prayer)}
                />
                <span
                  className={`text-sm ${
                    salah[prayer] ? "font-medium line-through text-muted-foreground" : ""
                  }`}
                >
                  {tp(prayer)}
                </span>
              </label>
              {prayerLoading ? (
                <Skeleton className="h-4 w-12" />
              ) : prayerData?.timings ? (
                <span className="text-xs text-muted-foreground font-mono">
                  {prayer === "taraweeh"
                    ? tp("afterIsha")
                    : prayerData.timings[
                        (prayer.charAt(0).toUpperCase() +
                          prayer.slice(1)) as keyof typeof prayerData.timings
                      ] || ""}
                </span>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fasting */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <Label className="text-sm font-medium">{t("fastingToday")}</Label>
            </div>
            <Switch
              checked={fasting}
              onCheckedChange={(checked) => {
                setFasting(checked);
                scheduleAutoSave();
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quran Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("quranReading")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{t("pagesReadToday")}</span>
            <span className="font-bold">{quranPages}</span>
          </div>
          <Slider
            value={[quranPages]}
            onValueChange={([v]) => {
              setQuranPages(v);
              scheduleAutoSave();
            }}
            min={0}
            max={20}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            {t("goalPages", { count: planner?.goals?.quran_pages_per_day ?? 5 })}
          </p>
        </CardContent>
      </Card>

      {/* Habits */}
      {Object.keys(habits).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4" />
              {t("dailyHabits")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(habits).map(([habit, done]) => (
              <label
                key={habit}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  done
                    ? "bg-emerald-50 dark:bg-emerald-950/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={done}
                  onCheckedChange={() => handleHabitToggle(habit)}
                />
                <span
                  className={`text-sm capitalize ${
                    done ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {habit.replace(/-/g, " ")}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Journal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("journalTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t("journalPlaceholder")}
            value={journal}
            onChange={(e) => {
              setJournal(e.target.value);
              scheduleAutoSave();
            }}
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Save button */}
      <Button
        onClick={saveProgress}
        disabled={upsertProgress.isPending}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
        size="lg"
      >
        {upsertProgress.isPending ? (
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
          t("saveProgress")
        )}
      </Button>

      {mode === "spark" && (
        <p className="text-xs text-center text-muted-foreground">
          {t("xpEarned", { count: salahCount * 10 + quranPages * 5 })}
        </p>
      )}
    </div>
  );
}
