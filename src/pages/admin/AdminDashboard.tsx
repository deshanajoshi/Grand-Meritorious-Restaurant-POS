import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Armchair,
  Users,
  Trophy,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { useStore } from "../../lib/store";
import { Card, StatPill } from "../../components/ui";
import {
  rupee,
  isToday,
  isThisMonth,
  sumTotals,
  TABLE_META,
} from "../../lib/utils";

const GOLD = ["#f3d488", "#d9b25e", "#bf9444", "#a9823a", "#8a6a2e", "#6e5424"];

export default function AdminDashboard() {
  const orders = useStore((s) => s.orders);
  const tables = useStore((s) => s.tables);
  const users = useStore((s) => s.users);
  const menu = useStore((s) => s.menu);

  const paid = orders.filter((o) => o.paid);
  const todaySales = sumTotals(paid.filter((o) => isToday(o.completedAt ?? o.createdAt)));
  const monthSales = sumTotals(paid.filter((o) => isThisMonth(o.completedAt ?? o.createdAt)));
  const todayOrders = paid.filter((o) => isToday(o.completedAt ?? o.createdAt)).length;
  const activeTables = tables.filter((t) => t.status !== "available").length;
  const activeWaiters = users.filter((u) => u.role === "waiter" && u.active).length;

  // 14-day revenue trend
  const trend = useMemo(() => {
    const days: { day: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayOrders = paid.filter((o) => {
        const od = new Date(o.completedAt ?? o.createdAt);
        return (
          od.getDate() === d.getDate() &&
          od.getMonth() === d.getMonth() &&
          od.getFullYear() === d.getFullYear()
        );
      });
      days.push({
        day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: sumTotals(dayOrders),
        orders: dayOrders.length,
      });
    }
    return days;
  }, [paid]);

  // popular items
  const popular = useMemo(() => {
    const counts: Record<string, { name: string; qty: number }> = {};
    paid.forEach((o) =>
      o.items.forEach((it) => {
        counts[it.itemId] = counts[it.itemId] || { name: it.name, qty: 0 };
        counts[it.itemId].qty += it.qty;
      }),
    );
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [paid]);

  // payment split
  const payments = useMemo(() => {
    const map: Record<string, number> = { cash: 0, upi: 0, card: 0 };
    paid.forEach((o) => {
      if (o.paymentMethod) map[o.paymentMethod] += o.total;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, [paid]);

  const stats = [
    { label: "Today's Sales", value: rupee(todaySales), accent: "#d9b25e", icon: <IndianRupee className="h-5 w-5" /> },
    { label: "Monthly Sales", value: rupee(monthSales), accent: "#5fd28e", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Orders Today", value: todayOrders, accent: "#8fb3ff", icon: <ShoppingBag className="h-5 w-5" /> },
    { label: "Active Tables", value: `${activeTables}/${tables.length}`, accent: "#ff9f5a", icon: <Armchair className="h-5 w-5" /> },
    { label: "Active Waiters", value: activeWaiters, accent: "#c9a3ff", icon: <Users className="h-5 w-5" /> },
    { label: "Menu Items", value: menu.length, accent: "#f5c451", icon: <Trophy className="h-5 w-5" /> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <h1 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
        Admin <span className="gold-text">Dashboard</span>
      </h1>
      <p className="text-sm text-muted">
        Overview of {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StatPill {...s} />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-serif text-lg font-semibold text-cream">
            Revenue · Last 14 days
          </h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d9b25e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#d9b25e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e1cf" vertical={false} />
                <XAxis dataKey="day" stroke="#8c8268" fontSize={11} tickLine={false} />
                <YAxis stroke="#8c8268" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e9e1cf",
                    borderRadius: 12,
                    color: "#2a2418",
                  }}
                  formatter={(v: any) => [rupee(Number(v)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f3d488"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-lg font-semibold text-cream">
            Payment Split
          </h3>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payments}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {payments.map((_, i) => (
                    <Cell key={i} fill={GOLD[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e9e1cf",
                    borderRadius: 12,
                    color: "#2a2418",
                  }}
                  formatter={(v: any) => rupee(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4">
            {payments.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-cream/70">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: GOLD[i] }} />
                {p.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 font-serif text-lg font-semibold text-cream">
            Most Popular Items
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popular} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" stroke="#8c8268" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#8c8268"
                  fontSize={11}
                  width={110}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(217,178,94,0.08)" }}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e9e1cf",
                    borderRadius: 12,
                    color: "#2a2418",
                  }}
                  formatter={(v: any) => [`${Number(v)} sold`, "Qty"]}
                />
                <Bar dataKey="qty" radius={[0, 6, 6, 0]} fill="#d9b25e" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-serif text-lg font-semibold text-cream">
            Live Table Status
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4">
            {tables
              .sort((a, b) => a.number - b.number)
              .map((t) => {
                const m = TABLE_META[t.status];
                return (
                  <div
                    key={t.id}
                    className="grid aspect-square place-items-center rounded-xl border text-sm font-semibold"
                    style={{ borderColor: m.ring, background: m.bg, color: m.color }}
                  >
                    {t.number}
                  </div>
                );
              })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {Object.values(TABLE_META).map((m) => (
              <div key={m.label} className="flex items-center gap-1.5 text-xs text-cream/70">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                {m.label}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
