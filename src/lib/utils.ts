import type { Order, OrderStatus, TableStatus } from "./types";

export const rupee = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

export const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: { label: "Pending", color: "#f5c451", bg: "rgba(245,196,81,0.12)", dot: "#f5c451" },
  accepted: { label: "Accepted", color: "#8fb3ff", bg: "rgba(143,179,255,0.12)", dot: "#8fb3ff" },
  preparing: { label: "Preparing", color: "#ff9f5a", bg: "rgba(255,159,90,0.12)", dot: "#ff9f5a" },
  ready: { label: "Ready to Serve", color: "#5fd28e", bg: "rgba(95,210,142,0.14)", dot: "#5fd28e" },
  served: { label: "Served", color: "#c9a3ff", bg: "rgba(201,163,255,0.12)", dot: "#c9a3ff" },
  completed: { label: "Completed", color: "#9a8e76", bg: "rgba(154,142,118,0.12)", dot: "#9a8e76" },
};

export const TABLE_META: Record<
  TableStatus,
  { label: string; color: string; bg: string; ring: string }
> = {
  available: { label: "Available", color: "#5fd28e", bg: "rgba(95,210,142,0.10)", ring: "rgba(95,210,142,0.5)" },
  occupied: { label: "Occupied", color: "#ff9f5a", bg: "rgba(255,159,90,0.10)", ring: "rgba(255,159,90,0.5)" },
  billing: { label: "Billing", color: "#8fb3ff", bg: "rgba(143,179,255,0.10)", ring: "rgba(143,179,255,0.5)" },
};

export const ORDER_FLOW: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "served",
  "completed",
];

export const nextStatus = (s: OrderStatus): OrderStatus | null => {
  const i = ORDER_FLOW.indexOf(s);
  return i >= 0 && i < ORDER_FLOW.length - 1 ? ORDER_FLOW[i + 1] : null;
};

export const isToday = (ts: number) => {
  const d = new Date(ts);
  const n = new Date();
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  );
};

export const isThisMonth = (ts: number) => {
  const d = new Date(ts);
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};

export const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const sumTotals = (orders: Order[]) =>
  orders.reduce((s, o) => s + o.total, 0);
