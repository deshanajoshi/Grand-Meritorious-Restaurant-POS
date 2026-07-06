import { useMemo, useState } from "react";
import { Download, FileText, Receipt, TrendingUp, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useStore } from "../../lib/store";
import { Card, Btn } from "../../components/ui";
import { rupee, cn, sumTotals } from "../../lib/utils";

type Range = "daily" | "weekly" | "monthly";

export default function Reports() {
  const orders = useStore((s) => s.orders);
  const [range, setRange] = useState<Range>("daily");

  const paid = orders.filter((o) => o.paid);

  const cutoff = useMemo(() => {
    const now = Date.now();
    if (range === "daily") return now - 86400000;
    if (range === "weekly") return now - 7 * 86400000;
    return now - 30 * 86400000;
  }, [range]);

  const inRange = paid.filter((o) => (o.completedAt ?? o.createdAt) >= cutoff);

  const revenue = sumTotals(inRange);
  const gstCollected = inRange.reduce((s, o) => s + o.gst, 0);
  const serviceCharge = inRange.reduce((s, o) => s + o.serviceCharge, 0);
  const discounts = inRange.reduce((s, o) => s + o.discount, 0);
  const netSales = inRange.reduce((s, o) => s + o.subtotal, 0);
  const avgBill = inRange.length ? Math.round(revenue / inRange.length) : 0;

  // chart data
  const chartData = useMemo(() => {
    const buckets: Record<string, number> = {};
    const fmt = (d: Date) =>
      range === "monthly"
        ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : range === "weekly"
          ? d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })
          : d.toLocaleTimeString("en-IN", { hour: "2-digit" });
    inRange.forEach((o) => {
      const d = new Date(o.completedAt ?? o.createdAt);
      const key = fmt(d);
      buckets[key] = (buckets[key] || 0) + o.total;
    });
    return Object.entries(buckets).map(([label, value]) => ({ label, value }));
  }, [inRange, range]);

  // most ordered
  const topItems = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};
    inRange.forEach((o) =>
      o.items.forEach((it) => {
        counts[it.itemId] = counts[it.itemId] || { name: it.name, qty: 0, revenue: 0 };
        counts[it.itemId].qty += it.qty;
        counts[it.itemId].revenue += it.price * it.qty;
      }),
    );
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [inRange]);

  const exportCSV = () => {
    const header = "Order ID,Date,Table,Waiter,Subtotal,GST,Service,Discount,Total,Payment\n";
    const rows = inRange
      .map(
        (o) =>
          `${o.id},${new Date(o.completedAt ?? o.createdAt).toLocaleString("en-IN")},${o.tableNumber},${o.waiterName},${o.subtotal},${o.gst},${o.serviceCharge},${o.discount},${o.total},${o.paymentMethod}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${range}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    { label: "Gross Revenue", value: rupee(revenue), icon: <TrendingUp className="h-5 w-5" />, accent: "#d9b25e" },
    { label: "Net Sales", value: rupee(netSales), icon: <Receipt className="h-5 w-5" />, accent: "#5fd28e" },
    { label: "Total Orders", value: inRange.length, icon: <FileText className="h-5 w-5" />, accent: "#8fb3ff" },
    { label: "Avg. Bill", value: rupee(avgBill), icon: <Trophy className="h-5 w-5" />, accent: "#c9a3ff" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
            Reports
          </h1>
          <p className="text-sm text-muted">Sales, tax & performance analytics</p>
        </div>
        <Btn variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Btn>
      </div>

      <div className="mt-5 flex gap-2">
        {(["daily", "weekly", "monthly"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-xl border px-5 py-2.5 text-sm font-medium capitalize transition",
              range === r
                ? "border-gold bg-gold/12 text-gold"
                : "border-line text-cream/60",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <Card key={c.label} className="p-4">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ background: c.accent + "1a", color: c.accent }}
            >
              {c.icon}
            </div>
            <div className="mt-3 text-2xl font-bold" style={{ color: c.accent }}>
              {c.value}
            </div>
            <div className="text-xs text-muted">{c.label}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-5">
        <h3 className="font-serif text-lg font-semibold text-cream">Sales Trend</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9e1cf" vertical={false} />
              <XAxis dataKey="label" stroke="#8c8268" fontSize={11} tickLine={false} />
              <YAxis stroke="#8c8268" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                cursor={{ fill: "rgba(217,178,94,0.08)" }}
                contentStyle={{ background: "#ffffff", border: "1px solid #e9e1cf", borderRadius: 12, color: "#2a2418" }}
                formatter={(v: any) => [rupee(Number(v)), "Sales"]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#d9b25e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Tax report */}
        <Card className="p-5">
          <h3 className="mb-4 font-serif text-lg font-semibold text-cream">
            Tax & Charges Report
          </h3>
          <div className="space-y-3">
            <TaxRow label="Net Sales (taxable)" value={netSales} />
            <TaxRow label="GST Collected (5%)" value={gstCollected} accent="#5fd28e" />
            <TaxRow label="Service Charges" value={serviceCharge} />
            <TaxRow label="Discounts Given" value={discounts} accent="#ff9f5a" minus />
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="font-medium text-cream">Gross Collected</span>
              <span className="font-serif text-xl font-bold text-gold">
                {rupee(revenue)}
              </span>
            </div>
          </div>
        </Card>

        {/* Most ordered */}
        <Card className="p-5">
          <h3 className="mb-4 font-serif text-lg font-semibold text-cream">
            Most Ordered Items
          </h3>
          <div className="space-y-2">
            {topItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No data for this period.</p>
            ) : (
              topItems.map((it, i) => (
                <div
                  key={it.name}
                  className="flex items-center gap-3 rounded-xl bg-ink/50 px-3 py-2.5"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold/12 text-sm font-bold text-gold">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-cream">{it.name}</span>
                  <span className="text-xs text-muted">{it.qty} sold</span>
                  <span className="text-sm font-semibold text-gold">
                    {rupee(it.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TaxRow({
  label,
  value,
  accent,
  minus,
}: {
  label: string;
  value: number;
  accent?: string;
  minus?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-cream/70">{label}</span>
      <span style={{ color: accent }} className={accent ? "" : "text-cream"}>
        {minus ? "− " : ""}{rupee(value)}
      </span>
    </div>
  );
}
