"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentPlanner } from "@/lib/hooks/use-planner";
import { useAllProgress } from "@/lib/hooks/use-daily-progress";
import { useMode } from "@/lib/context/mode-context";
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

export default function GoalsPage() {
  const { mode } = useMode();
  const { data: planner, isLoading } = useCurrentPlanner();
  const { data: allProgress } = useAllProgress(planner?.id ?? null);
  const queryClient = useQueryClient();

  const [quranGoal, setQuranGoal] = useState(5);
  const [habits, setHabits] = useState<string[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (planner?.goals) {
      setQuranGoal(planner.goals.quran_pages_per_day);
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

  const handleSave = async () => {
    if (!planner) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("planners")
      .update({
        goals: { quran_pages_per_day: quranGoal, habits },
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
  const quranTarget = quranGoal * 30;

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
        <h2 className="text-xl font-bold">No Planner Yet</h2>
        <p className="text-muted-foreground">Set up your planner first</p>
        <Button asChild>
          <Link href="/onboarding">Set Up Planner</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Target className="h-5 w-5" />
        Goals & Habits
      </h1>

      {/* Quran Goal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Quran Reading Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Daily target</span>
            <span className="font-bold">{quranGoal} pages/day</span>
          </div>
          <Slider
            value={[quranGoal]}
            onValueChange={([v]) => setQuranGoal(v)}
            min={1}
            max={20}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            {quranGoal >= 20
              ? "You'll complete the Quran in Ramadan!"
              : `${quranGoal * 30} pages in 30 days (~${Math.ceil(604 / quranGoal)} days to finish)`}
          </p>

          <Separator />

          {/* Progress comparison */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total pages read</span>
              <span className="font-medium">
                {totalQuranPages} / {quranTarget}
              </span>
            </div>
            <Progress
              value={(totalQuranPages / quranTarget) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Avg: {avgQuranPages} pages/day
              {avgQuranPages >= quranGoal
                ? " — On track!"
                : " — Keep pushing!"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Habits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daily Habits</CardTitle>
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
              No habits added yet
            </p>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Add a habit..."
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
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Saved!
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Goals
          </>
        )}
      </Button>
    </div>
  );
}
