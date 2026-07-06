import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Banknote,
  Smartphone,
  CreditCard,
  Printer,
  Download,
  ChevronLeft,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Btn, Card, inputCls, VegBadge } from "../../components/ui";
import { rupee, cn, fmtDate, fmtTime } from "../../lib/utils";
import { RESTAURANT } from "../../lib/seed";
import type { PaymentMethod } from "../../lib/types";

export default function Bill() {
  const { id } = useParams();
  const nav = useNavigate();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const payOrder = useStore((s) => s.payOrder);

  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [discountPct, setDiscountPct] = useState(0);
  const [done, setDone] = useState(order?.paid ?? false);

  if (!order) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="text-muted">Order not found.</p>
          <Btn className="mt-4" onClick={() => nav("/waiter/orders")}>
            Back to Orders
          </Btn>
        </div>
      </div>
    );
  }

  const discount = order.paid
    ? order.discount
    : Math.round(order.subtotal * (discountPct / 100));
  const grand = order.subtotal + order.gst + order.serviceCharge - discount;

  const settle = () => {
    payOrder(order.id, method, discount);
    setDone(true);
  };

  const downloadPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(invoiceHTML(order, discount, grand, method));
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">
      <div className="no-print mb-5 flex items-center gap-3">
        <button
          onClick={() => nav("/waiter/orders")}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line text-cream/70"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-serif text-2xl font-semibold text-cream sm:text-3xl">
          {done ? "Bill Settled" : "Generate Bill"}
        </h1>
      </div>

      {done && (
        <div className="no-print mb-5 flex items-center gap-3 rounded-2xl border border-[#5fd28e]/40 bg-[#5fd28e]/10 px-5 py-4">
          <CheckCircle2 className="h-6 w-6 text-[#5fd28e]" />
          <div>
            <p className="font-medium text-cream">
              Payment received via {method.toUpperCase()}
            </p>
            <p className="text-sm text-muted">
              Table {order.tableNumber} is now available.
            </p>
          </div>
        </div>
      )}

      {/* Invoice */}
      <Card className="overflow-hidden" >
        <div id="invoice" className="bg-panel">
          <div className="border-b border-line px-6 py-6 text-center">
            <h2 className="font-serif text-3xl font-bold text-cream">
              {RESTAURANT.name}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-gold">
              {RESTAURANT.tagline}
            </p>
            <p className="mt-2 text-xs text-muted">{RESTAURANT.address}</p>
            <p className="text-xs text-muted">
              GSTIN: {RESTAURANT.gstin} · FSSAI: {RESTAURANT.fssai}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm">
            <div>
              <p className="text-muted">Invoice</p>
              <p className="font-medium text-cream">#{order.id}</p>
            </div>
            <div>
              <p className="text-muted">Table</p>
              <p className="font-medium text-cream">No. {order.tableNumber}</p>
            </div>
            <div>
              <p className="text-muted">Date</p>
              <p className="font-medium text-cream">
                {fmtDate(order.createdAt)} · {fmtTime(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted">Server</p>
              <p className="font-medium text-cream">{order.waiterName}</p>
            </div>
          </div>

          <div className="border-t border-line px-6 py-4">
            <div className="mb-2 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider text-muted">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>
            {order.items.map((it) => (
              <div
                key={it.itemId}
                className="grid grid-cols-12 gap-2 border-t border-line/50 py-2 text-sm"
              >
                <div className="col-span-6 flex items-center gap-2">
                  <VegBadge type={it.veg} />
                  <span className="text-cream">{it.name}</span>
                </div>
                <span className="col-span-2 text-center text-cream/70">{it.qty}</span>
                <span className="col-span-2 text-right text-cream/70">
                  {rupee(it.price)}
                </span>
                <span className="col-span-2 text-right text-cream">
                  {rupee(it.price * it.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-line px-6 py-4">
            <div className="ml-auto max-w-xs space-y-1.5 text-sm">
              <Line label="Subtotal" value={rupee(order.subtotal)} />
              <Line label={`GST (${RESTAURANT.gstRate * 100}%)`} value={rupee(order.gst)} />
              {order.serviceCharge > 0 && (
                <Line
                  label={`Service (${RESTAURANT.serviceChargeRate * 100}%)`}
                  value={rupee(order.serviceCharge)}
                />
              )}
              {discount > 0 && (
                <Line label="Discount" value={"− " + rupee(discount)} accent="#5fd28e" />
              )}
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2.5">
                <span className="font-serif text-lg font-semibold text-cream">
                  Grand Total
                </span>
                <span className="font-serif text-2xl font-bold text-gold">
                  {rupee(grand)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-line px-6 py-4 text-center">
            <p className="text-xs text-muted">
              Thank you for dining at {RESTAURANT.name} · Visit again!
            </p>
          </div>
        </div>
      </Card>

      {/* Controls */}
      {!done && (
        <div className="no-print mt-5 space-y-5">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-cream">
              <Percent className="h-4 w-4 text-gold" /> Discount
            </label>
            <div className="flex gap-2">
              {[0, 5, 10, 15, 20].map((p) => (
                <button
                  key={p}
                  onClick={() => setDiscountPct(p)}
                  className={cn(
                    "flex-1 rounded-xl border py-2.5 text-sm font-medium transition",
                    discountPct === p
                      ? "border-gold bg-gold/12 text-gold"
                      : "border-line text-cream/60",
                  )}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-cream">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { k: "cash", label: "Cash", icon: <Banknote className="h-5 w-5" /> },
                  { k: "upi", label: "UPI", icon: <Smartphone className="h-5 w-5" /> },
                  { k: "card", label: "Card", icon: <CreditCard className="h-5 w-5" /> },
                ] as const
              ).map((m) => (
                <button
                  key={m.k}
                  onClick={() => setMethod(m.k)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border py-4 transition",
                    method === m.k
                      ? "border-gold bg-gold/12 text-gold"
                      : "border-line text-cream/60",
                  )}
                >
                  {m.icon}
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Btn className="w-full py-4 text-base" onClick={settle}>
            <CheckCircle2 className="h-5 w-5" /> Settle Bill · {rupee(grand)}
          </Btn>
        </div>
      )}

      <div className="no-print mt-4 flex gap-2">
        <Btn variant="outline" className="flex-1 py-3" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print
        </Btn>
        <Btn variant="outline" className="flex-1 py-3" onClick={downloadPDF}>
          <Download className="h-4 w-4" /> Download PDF
        </Btn>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between text-cream/70">
      <span>{label}</span>
      <span style={{ color: accent }} className={accent ? "" : "text-cream/80"}>
        {value}
      </span>
    </div>
  );
}

function invoiceHTML(
  order: ReturnType<typeof useStore.getState>["orders"][number],
  discount: number,
  grand: number,
  method: string,
) {
  const rows = order.items
    .map(
      (it) =>
        `<tr><td>${it.name}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">₹${it.price}</td><td style="text-align:right">₹${it.price * it.qty}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.id}</title>
  <style>
    body{font-family:Georgia,serif;max-width:480px;margin:24px auto;color:#1a1408;padding:0 16px}
    h1{text-align:center;margin:0;font-size:28px}
    .tag{text-align:center;letter-spacing:3px;font-size:10px;text-transform:uppercase;color:#a9823a;margin:4px 0}
    .muted{color:#666;font-size:11px;text-align:center;margin:2px 0}
    table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
    th{text-align:left;border-bottom:2px solid #ddd;padding:6px 4px;font-size:11px;text-transform:uppercase}
    td{padding:6px 4px;border-bottom:1px solid #eee}
    .totals{margin-top:12px;font-size:13px}
    .totals div{display:flex;justify-content:space-between;padding:3px 0}
    .grand{font-weight:bold;font-size:18px;border-top:2px solid #ddd;padding-top:8px;margin-top:6px}
    .foot{text-align:center;margin-top:20px;font-size:11px;color:#666}
    hr{border:none;border-top:1px solid #ddd;margin:12px 0}
  </style></head><body>
  <h1>${RESTAURANT.name}</h1>
  <div class="tag">${RESTAURANT.tagline}</div>
  <div class="muted">${RESTAURANT.address}</div>
  <div class="muted">GSTIN: ${RESTAURANT.gstin} · FSSAI: ${RESTAURANT.fssai}</div>
  <hr/>
  <div style="display:flex;justify-content:space-between;font-size:12px">
    <span>Invoice #${order.id}</span><span>Table ${order.tableNumber}</span>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px">
    <span>${fmtDate(order.createdAt)} ${fmtTime(order.createdAt)}</span><span>Server: ${order.waiterName}</span>
  </div>
  <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="totals">
    <div><span>Subtotal</span><span>₹${order.subtotal}</span></div>
    <div><span>GST (${RESTAURANT.gstRate * 100}%)</span><span>₹${order.gst}</span></div>
    ${order.serviceCharge > 0 ? `<div><span>Service (${RESTAURANT.serviceChargeRate * 100}%)</span><span>₹${order.serviceCharge}</span></div>` : ""}
    ${discount > 0 ? `<div><span>Discount</span><span>− ₹${discount}</span></div>` : ""}
    <div class="grand"><span>Grand Total</span><span>₹${grand}</span></div>
    <div style="margin-top:6px"><span>Payment</span><span>${method.toUpperCase()}</span></div>
  </div>
  <div class="foot">Thank you for dining with us · Visit again!</div>
  </body></html>`;
}
