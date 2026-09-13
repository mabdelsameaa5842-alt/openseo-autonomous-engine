import * as React from "react";
import { Lock, User, ShieldCheck, KeyRound, Sparkles, LogOut } from "lucide-react";

interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTitle: string;
  avatar: string;
  permissions: string[];
}

interface SuperAdminContextType {
  user: SuperAdminUser | null;
  logout: () => Promise<void>;
}

const SuperAdminContext = React.createContext<SuperAdminContextType>({
  user: null,
  logout: async () => {},
});

export const useSuperAdmin = () => React.useContext(SuperAdminContext);

export function SuperAdminGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      sessionStorage.getItem("vorder_super_admin_auth") === "true" ||
      localStorage.getItem("vorder_super_admin_auth_remember") === "true"
    );
  });

  const [user, setUser] = React.useState<SuperAdminUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored =
        sessionStorage.getItem("vorder_super_admin_user") ||
        localStorage.getItem("vorder_super_admin_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [email, setEmail] = React.useState("mohamed701164@gmail.com");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check existing session on mount
  React.useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const token =
          sessionStorage.getItem("vorder_super_admin_token") ||
          localStorage.getItem("vorder_super_admin_token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/auth/super-admin/session", { headers });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.authenticated && data.user && isMounted) {
            setUser(data.user);
            setIsAuthenticated(true);
            sessionStorage.setItem("vorder_super_admin_auth", "true");
            sessionStorage.setItem("vorder_super_admin_user", JSON.stringify(data.user));
          }
        }
      } catch (e) {
        console.warn("[SuperAdminGate] Session verification check failed:", e);
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/super-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = (await res.json()) as any;

      if (!res.ok || !data.success) {
        setError(data.error || "بيانات الدخول غير صحيحة.");
        setLoading(false);
        return;
      }

      setUser(data.user);
      setIsAuthenticated(true);

      // Store credentials
      sessionStorage.setItem("vorder_super_admin_auth", "true");
      sessionStorage.setItem("vorder_super_admin_token", data.token);
      sessionStorage.setItem("vorder_super_admin_user", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("vorder_super_admin_auth_remember", "true");
        localStorage.setItem("vorder_super_admin_token", data.token);
        localStorage.setItem("vorder_super_admin_user", JSON.stringify(data.user));
      }

      setLoading(false);
    } catch (err: any) {
      setError("تعذر الاتصال بالسيرفر السحابي. يرجى المحاولة لاحقاً.");
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/super-admin/logout", { method: "POST" });
    } catch {}

    sessionStorage.removeItem("vorder_super_admin_auth");
    sessionStorage.removeItem("vorder_super_admin_token");
    sessionStorage.removeItem("vorder_super_admin_user");
    localStorage.removeItem("vorder_super_admin_auth_remember");
    localStorage.removeItem("vorder_super_admin_token");
    localStorage.removeItem("vorder_super_admin_user");

    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 selection:bg-[#FFC400] selection:text-black overflow-y-auto"
        style={{
          backgroundColor: "#050505",
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(255,196,0,0.08) 0%, rgba(5,5,5,0.95) 75%)",
        }}
        dir="rtl"
      >
        {/* Apple HIG Liquid Glass Card */}
        <div className="relative w-full max-w-md my-auto rounded-3xl border border-[#FFC400]/25 bg-[#0E0E0E]/90 p-8 shadow-2xl backdrop-blur-2xl transition-all">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#FFC400]/15 blur-3xl" />

          {/* Header & MA Monogram Badge */}
          <div className="flex flex-col items-center text-center mb-7 relative">
            <div className="relative mb-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#FFC400]/20 blur-md animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FFC400] bg-[#050505] shadow-[0_0_25px_rgba(255,196,0,0.35)]">
                <span className="font-cairo text-2xl font-black tracking-wider text-[#FFC400]">
                  MA
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC400]/10 border border-[#FFC400]/30 text-[#FFC400] text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>منظومة الحماية والإدارة المركزية 2026</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              بوابة تحكم الإدارة والأداء
            </h1>
            <p className="text-xs text-stone-400 mt-1 font-medium">
              OpenSEO Autonomous Engine & Performance Studio
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                <span className="shrink-0 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FFC400]" />
                البريد الإلكتروني المعتمد للمدير
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mohamed701164@gmail.com"
                className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-stone-600 outline-none transition-colors focus:border-[#FFC400] focus:ring-1 focus:ring-[#FFC400]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#FFC400]" />
                كلمة المرور المشفرة
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-stone-600 outline-none transition-colors focus:border-[#FFC400] focus:ring-1 focus:ring-[#FFC400]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-900 text-[#FFC400] focus:ring-[#FFC400]"
                />
                <span className="text-xs text-stone-400">
                  تذكر جلستي الآمنة (30 يوماً)
                </span>
              </label>
              <span className="text-[11px] text-[#FFC400] font-mono">
                HIG 2026 Secured
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#FFC400] py-3 text-sm font-bold text-black shadow-lg shadow-[#FFC400]/20 transition-all hover:bg-[#E5B000] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>جاري التحقق والمصادقة السحابية...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>دخول لوحة الإدارة (Sign In)</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[11px] text-stone-500 font-tajawal">
              مخصص فقط للمدير العام والتنفيذي م. محمد عبد السميع
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminContext.Provider value={{ user, logout }}>
      {children}
    </SuperAdminContext.Provider>
  );
}
