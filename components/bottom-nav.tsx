"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Home, Calendar, Target, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const NAV_ITEMS = [
    { href: "/dashboard" as const, icon: Home, label: t("home") },
    { href: "/calendar" as const, icon: Calendar, label: t("calendar") },
    { href: "/goals" as const, icon: Target, label: t("goals") },
    { href: "/stats" as const, icon: BarChart3, label: t("stats") },
    { href: "/settings" as const, icon: Settings, label: t("settings") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
            (item.href === "/dashboard" && pathname.startsWith("/dashboard"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
