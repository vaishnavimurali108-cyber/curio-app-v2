import { AuthProvider } from "@/context/auth-context";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-dvh bg-parchment">
        <TopBar />
        <main className="mx-auto max-w-md px-4 pb-24 pt-4">{children}</main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
