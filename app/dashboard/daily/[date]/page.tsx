import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DailyViewClient from "./daily-view-client";

export default function DailyViewPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <DailyViewClient />
    </Suspense>
  );
}
