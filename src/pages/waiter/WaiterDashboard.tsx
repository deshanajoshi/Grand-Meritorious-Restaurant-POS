import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Armchair,
  Clock,
  Flame,
  BellRing,
  CheckCircle2,
  ArrowRight,
  Utensils,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Card, StatPill, Btn } from "../../components/ui";
import { STATUS_META, fmtTime, rupee, isToday } from "../../lib/utils";

export default function WaiterDashboard() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders);
  const tables = useStore((s) => s.tables);
  const nav = useNavigate();

  const myActive = orders.filter(
    (o) => o.waiterId === user?.id && !o.paid && o.status !== "completed",
  );
  const activeTables = tables.filter((t) => t.status !== "available").length;
  const count = (s: string) => myActive.filter((o) => o.status === s).length;
  const completedToday = orders.filter(
    (o) => o.waiterId === user?.id && o.paid && o.completedAt && isToday(o.completedAt),
  );

  const stats = [
    { label: "Active Tables", value: activeTables, accent: "#d9b25e", icon: <Armchair className="h-5 w-5" /> },
    { label: "Pending", value: count("pending"), accent: "#f5c451", icon: <Clock className="h-5 w-5" /> },
    { label: "Preparing", value: count("preparing") + count("accepted"), accent: "#ff9f5a", icon: <Flame className="h-5 w-5" /> },
    { label: "Ready", value: count("ready"), accent: "#5fd28e", icon: <BellRing className="h-5 w-5" /> },
    { label: "Completed Today", value: completedToday.length, accent: "#9a8e76", icon: <CheckCircle2 className="h-5 w-5" /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-cream sm:text-4xl">
            Good service, <span className="gold-text">{user?.name.split(" ")[0]}</span>
          </h1>
        </div>
        <Btn onClick={() => nav("/waiter/tables")}>
          <Utensils className="h-4 w-4" /> Take New Order
        </Btn>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <StatPill {...s} />
          </motion.div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-serif text-xl font-semibold text-cream">
        My Active Orders
      </h2>
      {myActive.length === 0 ? (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <Utensils className="mb-3 h-10 w-10 text-line" />
          <p className="text-muted">No active orders. Tap a table to start.</p>
          <Btn className="mt-4" variant="outline" onClick={() => nav("/waiter/tables")}>
            View Tables
          </Btn>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {myActive
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((o) => {
              const meta = STATUS_META[o.status];
              return (
                <button
                  key={o.id}
                  onClick={() => nav("/waiter/orders")}
                  className="text-left"
                >
                  <Card className="p-4 transition hover:border-gold/40">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg font-semibold text-cream">
                        Table {o.tableNumber}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm text-muted">
                      {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <span className="text-xs text-muted">{fmtTime(o.createdAt)}</span>
                      <span className="flex items-center gap-1 font-semibold text-gold">
                        {rupee(o.total)} <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Card>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
