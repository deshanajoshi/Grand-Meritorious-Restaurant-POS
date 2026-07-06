import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User as UserIcon, ChefHat, ShieldCheck } from "lucide-react";
import { useStore } from "../lib/store";
import { Logo, Btn, inputCls } from "../components/ui";

export default function Login() {
  const login = useStore((s) => s.login);
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(username, password);
    if (!u) {
      setError("Invalid credentials. Please try again.");
      return;
    }
    nav(u.role === "admin" ? "/admin" : "/waiter");
  };

  const quick = (un: string, pw: string) => {
    setUsername(un);
    setPassword(pw);
    const u = login(un, pw);
    if (u) nav(u.role === "admin" ? "/admin" : "/waiter");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/hero.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf7f0]/95 via-[#faf7f0]/90 to-[#f3ead4]/85" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(800px circle at 80% 20%, rgba(169,130,58,0.16), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="rounded-3xl border border-line bg-panel/80 p-7 shadow-2xl backdrop-blur-xl sm:p-9">
            <h1 className="font-serif text-2xl font-semibold text-cream">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted">
              Sign in to the restaurant POS terminal
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className={inputCls + " pl-11"}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  autoCapitalize="none"
                />
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  className={inputCls + " pl-11"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-[#e25a5a]/15 px-4 py-2.5 text-sm text-[#ff8a8a]">
                  {error}
                </div>
              )}

              <Btn type="submit" className="w-full py-3.5 text-base">
                Sign In
              </Btn>
            </form>

            <div className="mt-7 border-t border-line pt-5">
              <p className="mb-3 text-center text-[11px] uppercase tracking-wider text-muted">
                Quick demo access
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => quick("admin", "admin123")}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-ink/50 py-3 transition hover:border-gold/50"
                >
                  <ShieldCheck className="h-5 w-5 text-gold" />
                  <span className="text-xs font-medium text-cream">Admin</span>
                </button>
                <button
                  onClick={() => quick("arjun", "waiter123")}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-ink/50 py-3 transition hover:border-gold/50"
                >
                  <ChefHat className="h-5 w-5 text-gold" />
                  <span className="text-xs font-medium text-cream">Waiter</span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            100% Pure Vegetarian · Paperless ordering · Secure · Fast
          </p>
        </motion.div>
      </div>
    </div>
  );
}
