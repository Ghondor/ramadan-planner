export type Mode = "classic" | "spark";
export type Madhab = "hanafi" | "shafi" | "maliki" | "hanbali";

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface Profile {
  id: string;
  user_id: string;
  mode: Mode;
  location: Location;
  madhab: Madhab;
  created_at: string;
  updated_at: string;
}

export type QuranGoalType = "1" | "2" | "3" | "custom";

export interface PlannerGoals {
  quran_pages_per_day: number;
  quran_goal_type?: QuranGoalType;
  habits: string[];
}

export interface Planner {
  id: string;
  user_id: string;
  year_hijri: number;
  start_date: string;
  end_date: string;
  goals: PlannerGoals;
  created_at: string;
}

export interface SalahStatus {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  taraweeh: boolean;
}

export interface DailyProgress {
  id: string;
  planner_id: string;
  user_id: string;
  gregorian_date: string;
  salah_status: SalahStatus;
  quran_pages: number;
  fasting: boolean;
  habits: Record<string, boolean>;
  journal_text: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  planner_id: string;
  type: string;
  earned_date: string;
  created_at: string;
}
