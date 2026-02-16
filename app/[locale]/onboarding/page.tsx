"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getRamadanDates } from "@/lib/api/ramadan";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Rocket,
  Moon,
} from "lucide-react";
import type { Mode, Madhab } from "@/lib/types/database";

const DEFAULT_HABITS = ["dhikr", "dua", "charity", "extra-sunnah", "reading"];

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Location & settings
  const [locationName, setLocationName] = useState("Hamburg");
  const [lat, setLat] = useState("53.5511");
  const [lng, setLng] = useState("9.9937");
  const [yearHijri, setYearHijri] = useState("1447");
  const [madhab, setMadhab] = useState<Madhab>("hanafi");

  // Step 2: Mode & goals
  const [mode, setMode] = useState<Mode>("classic");
  const [quranPagesPerDay, setQuranPagesPerDay] = useState(5);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([
    "dhikr",
    "dua",
    "charity",
  ]);

  const HABIT_LABELS: Record<string, string> = {
    dhikr: t("habitDhikr"),
    dua: t("habitDua"),
    charity: t("habitCharity"),
    "extra-sunnah": t("habitSunnah"),
    reading: t("habitReading"),
  };

  const toggleHabit = (habit: string) => {
    setSelectedHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: locationName,
      };

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          mode,
          location,
          madhab,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      // If profile doesn't exist yet (trigger may not have fired), create it
      if (profileError) {
        await supabase.from("profiles").upsert({
          user_id: user.id,
          mode,
          location,
          madhab,
        });
      }

      // Create planner
      const hijriYear = parseInt(yearHijri);
      const dates = getRamadanDates(hijriYear);

      await supabase.from("planners").insert({
        user_id: user.id,
        year_hijri: hijriYear,
        start_date: dates.start,
        end_date: dates.end,
        goals: {
          quran_pages_per_day: quranPagesPerDay,
          habits: selectedHabits,
        },
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somethingWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("stepOf", { step })}</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-2">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">{t("whereAreYou")}</CardTitle>
              <CardDescription>
                {t("locationDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="location">{t("city")}</Label>
                <Input
                  id="location"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Hamburg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="lat">{t("latitude")}</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lng">{t("longitude")}</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t("hijriYear")}</Label>
                <Select value={yearHijri} onValueChange={setYearHijri}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1447">{t("hijri1447")}</SelectItem>
                    <SelectItem value="1448">{t("hijri1448")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("madhabLabel")}</Label>
                <Select
                  value={madhab}
                  onValueChange={(v) => setMadhab(v as Madhab)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanafi">Hanafi</SelectItem>
                    <SelectItem value="shafi">Shafi&apos;i</SelectItem>
                    <SelectItem value="maliki">Maliki</SelectItem>
                    <SelectItem value="hanbali">Hanbali</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full"
                size="lg"
              >
                {tc("continue")}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Mode & Goals */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">{t("personalize")}</CardTitle>
              <CardDescription>
                {t("personalizeDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode selector */}
              <div className="space-y-3">
                <Label>{t("experienceMode")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode("classic")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      mode === "classic"
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                        : "border-border hover:border-amber-200"
                    }`}
                  >
                    <BookOpen className="h-5 w-5 mb-2 text-amber-500" />
                    <p className="font-semibold text-sm">{tc("classic")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("reflective")}
                    </p>
                  </button>
                  <button
                    onClick={() => setMode("spark")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      mode === "spark"
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-border hover:border-emerald-200"
                    }`}
                  >
                    <Sparkles className="h-5 w-5 mb-2 text-emerald-500" />
                    <p className="font-semibold text-sm">{tc("spark")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("gamified")}
                    </p>
                  </button>
                </div>
              </div>

              {/* Quran goal */}
              <div className="space-y-3">
                <Label>
                  {t("dailyQuranGoal", { count: quranPagesPerDay })}
                </Label>
                <Slider
                  value={[quranPagesPerDay]}
                  onValueChange={([v]) => setQuranPagesPerDay(v)}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {quranPagesPerDay >= 20
                    ? t("completeQuran")
                    : t("daysToComplete", { days: Math.ceil(604 / quranPagesPerDay) })}
                </p>
              </div>

              {/* Habits */}
              <div className="space-y-3">
                <Label>{t("dailyHabits")}</Label>
                <div className="space-y-2">
                  {DEFAULT_HABITS.map((habit) => (
                    <label
                      key={habit}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedHabits.includes(habit)}
                        onCheckedChange={() => toggleHabit(habit)}
                      />
                      <span className="text-sm">{HABIT_LABELS[habit]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  size="lg"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {tc("back")}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1"
                  size="lg"
                >
                  {tc("continue")}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-2">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">{t("readyTitle")}</CardTitle>
              <CardDescription>
                {t("readySummary")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("summaryLocation")}</span>
                  <span className="font-medium">{locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("summaryYear")}</span>
                  <span className="font-medium">{yearHijri} {tc("ah")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("summaryMadhab")}</span>
                  <span className="font-medium capitalize">{madhab}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("summaryMode")}</span>
                  <span className="font-medium capitalize flex items-center gap-1">
                    {mode === "spark" ? (
                      <Sparkles className="h-3 w-3" />
                    ) : (
                      <Moon className="h-3 w-3" />
                    )}
                    {mode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("summaryQuranGoal")}</span>
                  <span className="font-medium">
                    {tc("pagesPerDay", { count: quranPagesPerDay })}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">{t("summaryHabits")}</span>
                  <span className="font-medium text-right">
                    {selectedHabits.map((h) => HABIT_LABELS[h]).join(", ")}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                  size="lg"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {tc("back")}
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  size="lg"
                >
                  {isLoading ? t("creating") : t("beginRamadan")}
                  <Rocket className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
