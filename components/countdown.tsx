"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isRamadan, setIsRamadan] = useState(false);

  useEffect(() => {
    function calculate() {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsRamadan(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isRamadan) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          Ramadan Mubarak!
        </p>
        <p className="text-muted-foreground mt-1">
          Ramadan is here. Start your planner now.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Ramadan begins in
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Sec" },
        ].map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center bg-card border rounded-xl px-3 py-2 sm:px-5 sm:py-3 min-w-[60px] sm:min-w-[72px] shadow-sm"
          >
            <span className="text-2xl sm:text-3xl font-bold tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
