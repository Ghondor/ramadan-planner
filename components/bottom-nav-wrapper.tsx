import { Suspense } from "react";
import { BottomNav } from "./bottom-nav";

export function BottomNavWrapper() {
  return (
    <Suspense fallback={<div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background" />}>
      <BottomNav />
    </Suspense>
  );
}
