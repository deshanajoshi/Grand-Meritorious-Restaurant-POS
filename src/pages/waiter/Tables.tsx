import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Plus } from "lucide-react";
import { useStore } from "../../lib/store";
import { TABLE_META, rupee } from "../../lib/utils";

export default function Tables() {
  const tables = useStore((s) => s.tables);
  const orders = useStore((s) => s.orders);
  const startOrder = useStore((s) => s.startOrder);
  const nav = useNavigate();

  const open = (num: number) => {
    startOrder(num);
    nav("/waiter/order");
  };

  const orderFor = (num: number) =>
    orders.find((o) => o.tableNumber === num && !o.paid && o.status !== "completed");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
          Tables
        </h1>
      </div>
      <p className="text-sm text-muted">Tap any table to take or update an order</p>

      <div className="mt-5 flex flex-wrap gap-4">
        {Object.entries(TABLE_META).map(([k, m]) => (
          <div key={k} className="flex items-center gap-2 text-sm text-cream/70">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: m.color }}
            />
            {m.label}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tables
          .sort((a, b) => a.number - b.number)
          .map((t, i) => {
            const m = TABLE_META[t.status];
            const ord = orderFor(t.number);
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => open(t.number)}
                className="group relative overflow-hidden rounded-2xl border p-5 text-left transition active:scale-[0.97]"
                style={{
                  borderColor: m.ring,
                  background: m.bg,
                }}
              >
                <div
                  className="absolute right-0 top-0 h-16 w-16 rounded-bl-full opacity-20 transition group-hover:opacity-40"
                  style={{ background: m.color }}
                />
                <div className="flex items-start justify-between">
                  <div className="font-serif text-3xl font-bold text-cream">
                    {t.number}
                  </div>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: m.color, boxShadow: `0 0 10px ${m.color}` }}
                  />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-cream/60">
                  <Users className="h-3.5 w-3.5" /> {t.capacity} seats
                </div>
                <div
                  className="mt-3 text-xs font-medium"
                  style={{ color: m.color }}
                >
                  {m.label}
                </div>
                {ord && (
                  <div className="mt-1 text-xs text-cream/70">
                    {ord.items.length} items · {rupee(ord.total)}
                  </div>
                )}
                {t.status === "available" && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-gold opacity-0 transition group-hover:opacity-100">
                    <Plus className="h-3.5 w-3.5" /> New order
                  </div>
                )}
              </motion.button>
            );
          })}
      </div>
    </div>
  );
}
