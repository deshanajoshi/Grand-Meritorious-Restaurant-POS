import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useStore } from "../lib/store";
import { Logo } from "./ui";
import Notifications from "./Notifications";
import { cn } from "../lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export default function AppLayout({
  nav,
  children,
}: {
  nav: NavItem[];
  children: ReactNode;
}) {
  const user = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-ink-2/80 p-5 lg:flex">
        <Logo />
        <nav className="mt-9 flex-1 space-y-1.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-gold/12 text-gold"
                    : "text-cream/65 hover:bg-white/5 hover:text-cream",
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 rounded-2xl border border-line bg-panel p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 font-serif text-lg font-semibold text-gold">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-cream">
                {user?.name}
              </p>
              <p className="text-xs capitalize text-muted">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2 text-xs text-cream/70 transition hover:border-[#e25a5a]/40 hover:text-[#ff8a8a]"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink-2/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Notifications />
          <button
            onClick={signOut}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-cream/70"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pb-24 lg:pb-0">
        {/* Desktop top bar with notifications */}
        <div className="hidden items-center justify-end gap-3 border-b border-line px-8 py-3 lg:flex">
          <Notifications />
        </div>
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch justify-around border-t border-line bg-ink-2/95 backdrop-blur lg:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                isActive ? "text-gold" : "text-cream/55",
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
