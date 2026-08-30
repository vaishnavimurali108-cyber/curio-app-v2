import { AuthProvider } from "@/context/auth-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-dvh items-center justify-center bg-navy px-6">
        <div className="w-full max-w-sm">
          <p className="mb-6 text-center font-display text-3xl text-parchment">
            Curio
          </p>
          <div className="rounded-2xl border border-white/10 bg-parchment p-6 shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
