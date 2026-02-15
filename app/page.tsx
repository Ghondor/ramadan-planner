import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Countdown } from "@/components/countdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Moon, Sparkles, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const RAMADAN_START = "2026-02-17T00:00:00";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const ctaHref = user ? "/dashboard" : "/auth/sign-up";

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Moon className="h-5 w-5" />
            Ramadan Planner
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Islamic decorative element */}
          <div className="flex justify-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <Moon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Your Ramadan Journey
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              Track prayers, Quran reading, and daily habits throughout the
              blessed month. Stay consistent, stay inspired.
            </p>
          </div>

          {/* Countdown */}
          <Countdown targetDate={RAMADAN_START} />

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
            >
              <Link href={ctaHref}>
                {user ? "Go to Dashboard" : "Start Your Planner"}
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Mode Preview */}
      <section className="w-full bg-muted/50 py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Choose Your Experience
            </h2>
            <p className="text-muted-foreground">
              Two modes designed for different lifestyles
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Classic Mode */}
            <Card className="relative overflow-hidden border-2 hover:border-amber-400/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 opacity-50" />
              <CardHeader className="relative">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Classic</CardTitle>
                <CardDescription>
                  Reflective & family-focused
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2 text-sm text-muted-foreground">
                <p>Clean card layouts for daily tracking</p>
                <p>Journaling & spiritual reflection</p>
                <p>Subtle progress charts</p>
                <p>Warm, calming design</p>
              </CardContent>
            </Card>

            {/* Spark Mode */}
            <Card className="relative overflow-hidden border-2 hover:border-emerald-400/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 opacity-50" />
              <CardHeader className="relative">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Spark</CardTitle>
                <CardDescription>
                  Gamified & goal-driven
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2 text-sm text-muted-foreground">
                <p>XP bars & streak flames</p>
                <p>Achievement badges to earn</p>
                <p>Study-friendly time management</p>
                <p>Vibrant, energizing design</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              {
                icon: Moon,
                title: "Prayer Tracking",
                desc: "Never miss a prayer with real-time timetables",
              },
              {
                icon: BookOpen,
                title: "Quran Progress",
                desc: "Set daily page goals and track your reading",
              },
              {
                icon: Star,
                title: "30-Day Calendar",
                desc: "Visualize your consistency across Ramadan",
              },
            ].map((feature) => (
              <div key={feature.title} className="space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-8 px-4">
        <p className="text-muted-foreground">
          Ramadan Planner {new Date().getFullYear()} &middot; Built with faith & code
        </p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
