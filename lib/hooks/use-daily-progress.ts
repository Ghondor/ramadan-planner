"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { DailyProgress, SalahStatus } from "@/lib/types/database";

export function useDailyProgress(plannerId: string | null, date: string) {
  return useQuery({
    queryKey: ["daily-progress", plannerId, date],
    queryFn: async () => {
      if (!plannerId) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("planner_id", plannerId)
        .eq("gregorian_date", date)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return (data as DailyProgress) || null;
    },
    enabled: !!plannerId,
  });
}

export function useUpsertDailyProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progress: {
      planner_id: string;
      user_id: string;
      gregorian_date: string;
      salah_status: SalahStatus;
      quran_pages: number;
      fasting: boolean;
      habits: Record<string, boolean>;
      journal_text: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("daily_progress")
        .upsert(
          {
            ...progress,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "planner_id,gregorian_date" }
        )
        .select()
        .single();

      if (error) throw error;
      return data as DailyProgress;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["daily-progress", data.planner_id, data.gregorian_date],
      });
      queryClient.invalidateQueries({ queryKey: ["all-progress"] });
    },
  });
}

export function useAllProgress(plannerId: string | null) {
  return useQuery({
    queryKey: ["all-progress", plannerId],
    queryFn: async () => {
      if (!plannerId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("planner_id", plannerId)
        .order("gregorian_date", { ascending: true });

      if (error) throw error;
      return (data as DailyProgress[]) || [];
    },
    enabled: !!plannerId,
  });
}
