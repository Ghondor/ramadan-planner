import { BottomNavWrapper } from "@/components/bottom-nav-wrapper";

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNavWrapper />
    </div>
  );
}
