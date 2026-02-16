import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
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
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

const RAMADAN_START = "2026-02-17T00:00:00";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const ctaHref = user ? "/dashboard" : "/auth/sign-up";
  const t = await getTranslations("landing");
  const tc = await getTranslations("common");

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Moon className="h-5 w-5" />
            {tc("brand")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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
          <div className="flex justify-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <Moon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              {t("heroTitle")}
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {t("heroTitleAccent")}
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              {t("heroDescription")}
            </p>
          </div>

          <Countdown targetDate={RAMADAN_START} />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
            >
              <Link href={ctaHref}>
                {user ? t("goToDashboard") : t("startPlanner")}
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/auth/login">{t("signIn")}</Link>
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
              {t("chooseExperience")}
            </h2>
            <p className="text-muted-foreground">
              {t("twoModes")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden border-2 hover:border-amber-400/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 opacity-50" />
              <CardHeader className="relative">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">{tc("classic")}</CardTitle>
                <CardDescription>{t("classicDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2 text-sm text-muted-foreground">
                <p>{t("classicFeature1")}</p>
                <p>{t("classicFeature2")}</p>
                <p>{t("classicFeature3")}</p>
                <p>{t("classicFeature4")}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-emerald-400/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 opacity-50" />
              <CardHeader className="relative">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">{tc("spark")}</CardTitle>
                <CardDescription>{t("sparkDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2 text-sm text-muted-foreground">
                <p>{t("sparkFeature1")}</p>
                <p>{t("sparkFeature2")}</p>
                <p>{t("sparkFeature3")}</p>
                <p>{t("sparkFeature4")}</p>
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
                title: t("prayerTracking"),
                desc: t("prayerTrackingDesc"),
              },
              {
                icon: BookOpen,
                title: t("quranProgress"),
                desc: t("quranProgressDesc"),
              },
              {
                icon: Star,
                title: t("thirtyDayCalendar"),
                desc: t("thirtyDayCalendarDesc"),
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
          {t("footer", { year: new Date().getFullYear() })}
        </p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
