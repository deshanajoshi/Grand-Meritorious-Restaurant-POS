import { useState } from "react";
import { Bell, CheckCheck, Receipt, BellRing, ShoppingBag } from "lucide-react";
import { useStore } from "../lib/store";
import { timeAgo } from "../lib/utils";

export default function Notifications() {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationsRead);
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const icon = (t: string) =>
    t === "bill_generated" ? (
      <Receipt className="h-4 w-4" />
    ) : t === "order_ready" ? (
      <BellRing className="h-4 w-4" />
    ) : (
      <ShoppingBag className="h-4 w-4" />
    );

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markRead();
        }}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel text-cream/80 transition hover:text-gold"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#e25a5a] px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-medium text-cream">Notifications</span>
              <CheckCheck className="h-4 w-4 text-muted" />
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 30).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 border-b border-line/60 px-4 py-3 last:border-0"
                  >
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
                      {icon(n.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-cream/90">{n.message}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
