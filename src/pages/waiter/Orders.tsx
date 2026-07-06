import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Receipt, Pencil, ChefHat } from "lucide-react";
import { useStore } from "../../lib/store";
import { Card, Btn, VegBadge } from "../../components/ui";
import {
  STATUS_META,
  nextStatus,
  fmtTime,
  rupee,
  cn,
  ORDER_FLOW,
} from "../../lib/utils";

export default function Orders() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders);
  const updateStatus = useStore((s) => s.updateOrderStatus);
  const startOrder = useStore((s) => s.startOrder);
  const nav = useNavigate();
  const [filter, setFilter] = useState<string>("active");

  const mine = orders.filter((o) => o.waiterId === user?.id);
  const active = mine.filter((o) => !o.paid && o.status !== "completed");
  const list =
    filter === "active"
      ? active
      : filter === "all"
        ? mine
        : mine.filter((o) => o.status === filter);

  const edit = (num: number) => {
    startOrder(num);
    nav("/waiter/order");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="mb-1 flex items-center gap-3">
        <ChefHat className="h-7 w-7 text-gold" />
        <h1 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
          Kitchen Orders
        </h1>
      </div>
      <p className="text-sm text-muted">Track live status from kitchen to table</p>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {["active", "all", ...ORDER_FLOW].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition",
              filter === f
                ? "border-gold/60 bg-gold/12 text-gold"
                : "border-line text-cream/60",
            )}
          >
            {f === "active" ? "Active" : f === "all" ? "All" : STATUS_META[f as keyof typeof STATUS_META]?.label ?? f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card className="mt-6 grid place-items-center px-6 py-16 text-center text-muted">
          No orders here.
        </Card>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {list
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((o, i) => {
              const meta = STATUS_META[o.status];
              const next = nextStatus(o.status);
              const canBill = o.status === "served";
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-xl font-semibold text-cream">
                          Table {o.tableNumber}
                        </span>
                        <span className="text-xs text-muted">{fmtTime(o.createdAt)}</span>
                      </div>
                      <span
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: meta.dot }}
                        />
                        {meta.label}
                      </span>
                    </div>

                    <div className="space-y-2 px-4 py-3">
                      {o.items.map((it) => (
                        <div
                          key={it.itemId}
                          className="flex items-start justify-between gap-2 text-sm"
                        >
                          <div className="flex items-start gap-2">
                            <VegBadge type={it.veg} />
                            <div>
                              <span className="text-cream">
                                {it.qty}× {it.name}
                              </span>
                              {it.notes && (
                                <p className="text-xs italic text-gold/80">
                                  — {it.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-cream/70">
                            {rupee(it.price * it.qty)}
                          </span>
                        </div>
                      ))}
                      {o.specialInstructions && (
                        <p className="mt-1 rounded-lg bg-ink px-3 py-2 text-xs italic text-muted">
                          Note: {o.specialInstructions}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-line px-4 py-3">
                      <span className="font-serif text-lg font-semibold text-gold">
                        {rupee(o.total)}
                      </span>
                      <div className="flex gap-2">
                        {!o.paid && (
                          <button
                            onClick={() => edit(o.tableNumber)}
                            className="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-xs text-cream/70 hover:text-gold"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                        )}
                        {canBill ? (
                          <Btn
                            onClick={() => nav(`/waiter/bill/${o.id}`)}
                            className="px-4 py-2 text-sm"
                          >
                            <Receipt className="h-4 w-4" /> Bill
                          </Btn>
                        ) : next && next !== "completed" ? (
                          <Btn
                            variant="outline"
                            onClick={() => updateStatus(o.id, next)}
                            className="px-4 py-2 text-sm"
                          >
                            {STATUS_META[next].label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Btn>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      )}
    </div>
  );
}
