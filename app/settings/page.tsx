"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile, useUpdateProfile } from "@/lib/hooks/use-profile";
import { useCurrentPlanner } from "@/lib/hooks/use-planner";
import { useAllProgress } from "@/lib/hooks/use-daily-progress";
import { useMode } from "@/lib/context/mode-context";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  User,
  MapPin,
  Palette,
  Download,
  Trash2,
  LogOut,
  Save,
  Check,
  Loader2,
  BookOpen,
  Sparkles,
  KeyRound,
} from "lucide-react";
import type { Madhab, Mode } from "@/lib/types/database";

export default function SettingsPage() {
  const router = useRouter();
  const { mode, setMode } = useMode();
  const { data: profile, isLoading } = useProfile();
  const { data: planner } = useCurrentPlanner();
  const { data: allProgress } = useAllProgress(planner?.id ?? null);
  const updateProfile = useUpdateProfile();

  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [madhab, setMadhab] = useState<Madhab>("hanafi");
  const [selectedMode, setSelectedMode] = useState<Mode>("classic");
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setLocationName(profile.location.name);
      setLat(String(profile.location.lat));
      setLng(String(profile.location.lng));
      setMadhab(profile.madhab);
      setSelectedMode(profile.mode);
    }
  }, [profile]);

  const handleSave = async () => {
    const updates = {
      mode: selectedMode,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: locationName,
      },
      madhab,
    };
    await updateProfile.mutateAsync(updates as never);
    setMode(selectedMode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = () => {
    if (!allProgress) return;
    const blob = new Blob([JSON.stringify(allProgress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ramadan-data-${planner?.year_hijri || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = async () => {
    setDeleting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("daily_progress").delete().eq("user_id", user.id);
      await supabase.from("achievements").delete().eq("user_id", user.id);
      await supabase.from("planners").delete().eq("user_id", user.id);
      setDeleteOpen(false);
      router.push("/onboarding");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Settings
      </h1>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode */}
          <div className="space-y-2">
            <Label>Experience Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedMode("classic")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  selectedMode === "classic"
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : "border-border"
                }`}
              >
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Classic</span>
              </button>
              <button
                onClick={() => setSelectedMode("spark")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  selectedMode === "spark"
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                    : "border-border"
                }`}
              >
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">Spark</span>
              </button>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Location
            </Label>
            <Input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="City name"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitude"
              />
              <Input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Longitude"
              />
            </div>
          </div>

          {/* Madhab */}
          <div className="space-y-2">
            <Label>Madhab</Label>
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
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full"
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <ThemeSwitcher />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push("/auth/update-password")}
          >
            <KeyRound className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportData}
            disabled={!allProgress?.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data (JSON)
          </Button>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Planner Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete all data?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your planners, daily progress,
                  and achievements. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteData}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
