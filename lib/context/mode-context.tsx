"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Mode } from "@/lib/types/database";

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isLoading: boolean;
}

const ModeContext = createContext<ModeContextType>({
  mode: "classic",
  setMode: () => {},
  isLoading: true,
});

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ramadan-mode") as Mode) || "classic";
    }
    return "classic";
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMode() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("mode")
            .eq("user_id", user.id)
            .single();
          if (profile?.mode) {
            setModeState(profile.mode as Mode);
            localStorage.setItem("ramadan-mode", profile.mode);
          }
        }
      } catch {
        // Use localStorage fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadMode();
  }, []);

  const setMode = useCallback(async (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("ramadan-mode", newMode);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ mode: newMode, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }
    } catch {
      // Optimistic update already applied
    }
  }, []);

  return (
    <ModeContext.Provider value={{ mode, setMode, isLoading }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
