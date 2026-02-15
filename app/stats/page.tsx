"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCurrentPlanner } from "@/lib/hooks/use-planner";
import { useAllProgress } from "@/lib/hooks/use-daily-progress";
import { useMode } from "@/lib/context/mode-context";
import { calculateStreak } from "@/components/streak-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  BookOpen,
  Download,
  Flame,
  Loader2,
  Moon,
  Star,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const SPARK_BADGES = [
  { type: "first-prayer", label: "First Prayer", icon: "star", threshold: 1 },
  { type: "week-streak", label: "7-Day Streak", icon: "flame", threshold: 7 },
  { type: "half-quran", label: "Half Quran", icon: "book", threshold: 302 },
  { type: "full-month", label: "30 Days Strong", icon: "trophy", threshold: 30 },
  { type: "perfect-day", label: "Perfect Day", icon: "star", threshold: 1 },
];

export default function StatsPage() {
  const { mode } = useMode();
  const { data: planner, isLoading: plannerLoading } = useCurrentPlanner();
  const { data: allProgress, isLoading: progressLoading } = useAllProgress(
    planner?.id ?? null
  );
  const statsRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const stats = useMemo(() => {
    if (!allProgress?.length) return null;

    const totalPrayers = allProgress.reduce((sum, p) => {
      return sum + Object.values(p.salah_status).filter(Boolean).length;
    }, 0);

    const totalQuranPages = allProgress.reduce(
      (sum, p) => sum + p.quran_pages,
      0
    );

    const daysLogged = allProgress.length;
    const streak = calculateStreak(allProgress);
    const fastingDays = allProgress.filter((p) => p.fasting).length;

    const salahChartData = allProgress.map((p) => {
      const dayNum =
        allProgress.indexOf(p) + 1;
      return {
        day: `D${dayNum}`,
        prayers: Object.values(p.salah_status).filter(Boolean).length,
      };
    });

    const quranChartData = allProgress.map((p, i) => ({
      day: `D${i + 1}`,
      pages: p.quran_pages,
      goal: planner?.goals?.quran_pages_per_day ?? 5,
    }));

    const perfectDays = allProgress.filter((p) => {
      const allSalah = Object.values(p.salah_status).every(Boolean);
      const hitQuranGoal =
        p.quran_pages >= (planner?.goals?.quran_pages_per_day ?? 5);
      return allSalah && hitQuranGoal && p.fasting;
    }).length;

    return {
      totalPrayers,
      totalQuranPages,
      daysLogged,
      streak,
      fastingDays,
      salahChartData,
      quranChartData,
      perfectDays,
    };
  }, [allProgress, planner]);

  const earnedBadges = useMemo(() => {
    if (!stats) return [];
    const earned: string[] = [];
    if (stats.totalPrayers >= 1) earned.push("first-prayer");
    if (stats.streak >= 7) earned.push("week-streak");
    if (stats.totalQuranPages >= 302) earned.push("half-quran");
    if (stats.daysLogged >= 30) earned.push("full-month");
    if (stats.perfectDays >= 1) earned.push("perfect-day");
    return earned;
  }, [stats]);

  const handleExportPDF = async () => {
    if (!statsRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(statsRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`ramadan-stats-${planner?.year_hijri || "1447"}.pdf`);
    } catch {
      // PDF export failed silently
    } finally {
      setExporting(false);
    }
  };

  const isLoading = plannerLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistics
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          disabled={exporting || !stats}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="ml-1.5 text-xs">PDF</span>
        </Button>
      </div>

      <div ref={statsRef} className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Star className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold">{stats?.totalPrayers ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Prayers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <BookOpen className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-2xl font-bold">
                {stats?.totalQuranPages ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Quran Pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-2xl font-bold">{stats?.streak ?? 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Moon className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold">{stats?.fastingDays ?? 0}</p>
              <p className="text-xs text-muted-foreground">Fasting Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Salah Chart */}
        {stats?.salahChartData && stats.salahChartData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Daily Prayer Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.salahChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 6]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar
                      dataKey="prayers"
                      fill="hsl(var(--chart-2))"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quran Chart */}
        {stats?.quranChartData && stats.quranChartData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quran Pages vs Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.quranChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="goal"
                      stroke="hsl(var(--chart-4))"
                      fill="none"
                      strokeDasharray="5 5"
                    />
                    <Area
                      type="monotone"
                      dataKey="pages"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Streak Heatmap */}
        {allProgress && allProgress.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Consistency Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 30 }).map((_, i) => {
                  const entry = allProgress[i];
                  const salahDone = entry
                    ? Object.values(entry.salah_status).filter(Boolean).length
                    : 0;
                  const intensity = entry ? salahDone / 6 : 0;
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-sm"
                      style={{
                        backgroundColor:
                          intensity > 0
                            ? `rgba(16, 185, 129, ${Math.max(intensity, 0.15)})`
                            : "hsl(var(--muted))",
                      }}
                      title={`Day ${i + 1}: ${salahDone}/6 prayers`}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spark Badges */}
        {mode === "spark" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {SPARK_BADGES.map((badge) => {
                  const earned = earnedBadges.includes(badge.type);
                  return (
                    <div
                      key={badge.type}
                      className={`flex items-center gap-2 p-3 rounded-xl border ${
                        earned
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                          : "opacity-40"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          earned
                            ? "bg-emerald-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        {badge.icon === "flame" && <Flame className="h-4 w-4" />}
                        {badge.icon === "star" && <Star className="h-4 w-4" />}
                        {badge.icon === "book" && <BookOpen className="h-4 w-4" />}
                        {badge.icon === "trophy" && <Trophy className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{badge.label}</p>
                        {earned && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0"
                          >
                            Earned
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
