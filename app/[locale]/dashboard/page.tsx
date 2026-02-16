import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
