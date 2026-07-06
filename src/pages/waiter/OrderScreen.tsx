import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ShoppingCart,
  StickyNote,
  Send,
  Leaf,
  Trash2,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Btn, VegBadge, Modal, inputCls } from "../../components/ui";
import { rupee, cn } from "../../lib/utils";
import { RESTAURANT } from "../../lib/seed";
import type { MenuItem } from "../../lib/types";

const QUICK_NOTES = [
  "Less spicy",
  "Extra spicy",
  "No onion",
  "No garlic",
  "Extra cheese",
  "Jain",
  "Less oil",
  "Well done",
];

export default function OrderScreen() {
  const nav = useNavigate();
  const menu = useStore((s) => s.menu);
  const categories = useStore((s) => s.categories);
  const draftTable = useStore((s) => s.draftTable);
  const draftItems = useStore((s) => s.draftItems);
  const draftInstructions = useStore((s) => s.draftInstructions);
  const draftServiceCharge = useStore((s) => s.draftServiceCharge);
  const addToDraft = useStore((s) => s.addToDraft);
  const setDraftQty = useStore((s) => s.setDraftQty);
  const setItemNotes = useStore((s) => s.setItemNotes);
  const setDraftInstructions = useStore((s) => s.setDraftInstructions);
  const toggleSC = useStore((s) => s.toggleServiceCharge);
  const submitDraft = useStore((s) => s.submitDraft);
  const cancelDraft = useStore((s) => s.cancelDraft);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [availOnly, setAvailOnly] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [noteItem, setNoteItem] = useState<string | null>(null);

  if (draftTable === null) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="text-muted">No table selected.</p>
          <Btn className="mt-4" onClick={() => nav("/waiter/tables")}>
            Choose a Table
          </Btn>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    return menu.filter((m) => {
      if (availOnly && !m.available) return false;
      if (cat !== "all" && m.category !== cat) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
          !m.description.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [menu, cat, availOnly, search]);

  const qtyOf = (id: string) =>
    draftItems.find((i) => i.itemId === id)?.qty ?? 0;

  const subtotal = draftItems.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = Math.round(subtotal * RESTAURANT.gstRate);
  const sc = draftServiceCharge
    ? Math.round(subtotal * RESTAURANT.serviceChargeRate)
    : 0;
  const total = subtotal + gst + sc;
  const itemCount = draftItems.reduce((s, i) => s + i.qty, 0);

  const submit = () => {
    const o = submitDraft();
    if (o) {
      setCartOpen(false);
      nav("/waiter/orders");
    }
  };

  const noteTarget = draftItems.find((i) => i.itemId === noteItem);

  return (
    <div className="relative">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-line bg-ink-2/95 backdrop-blur lg:top-[57px]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
          <button
            onClick={() => {
              cancelDraft();
              nav("/waiter/tables");
            }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-cream/70 hover:text-cream"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-serif text-xl font-semibold text-cream">
              Table {draftTable}
            </h1>
            <p className="text-xs text-muted">{itemCount} items in order</p>
          </div>
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className={inputCls + " py-2 pl-10"}
            />
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className={inputCls + " py-2.5 pl-10"}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-8">
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#5fd28e]/40 bg-[#5fd28e]/10 px-3 py-1.5 text-xs font-medium text-[#5fd28e]">
            <Leaf className="h-3 w-3" /> Pure Veg Kitchen
          </span>
          <button
            onClick={() => setAvailOnly((a) => !a)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              availOnly
                ? "border-gold/60 bg-gold/12 text-gold"
                : "border-line text-cream/60",
            )}
          >
            Available only
          </button>
        </div>

        {/* Category chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-line/60 px-4 py-2.5 sm:px-8">
          <button
            onClick={() => setCat("all")}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              cat === "all" ? "bg-gold/15 text-gold" : "text-cream/55 hover:text-cream",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                cat === c.id ? "bg-gold/15 text-gold" : "text-cream/55 hover:text-cream",
              )}
            >
              <span>{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      <div className="mx-auto max-w-6xl px-4 py-5 pb-32 sm:px-8 lg:pb-12 lg:pr-[26rem]">
        {filtered.length === 0 ? (
          <div className="grid place-items-center py-20 text-center text-muted">
            No dishes match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                qty={qtyOf(item.id)}
                onAdd={() => addToDraft(item)}
                onDec={() => setDraftQty(item.id, qtyOf(item.id) - 1)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop cart sidebar */}
      <div className="fixed bottom-0 right-0 top-[57px] hidden w-96 flex-col border-l border-line bg-ink-2/95 backdrop-blur lg:flex">
        <CartContent
          {...{
            draftItems,
            setDraftQty,
            subtotal,
            gst,
            sc,
            total,
            draftServiceCharge,
            toggleSC,
            draftInstructions,
            setDraftInstructions,
            setNoteItem,
            submit,
            table: draftTable,
          }}
        />
      </div>

      {/* Mobile cart button */}
      {itemCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full bg-gradient-to-br from-[#f3d488] to-[#bf9444] px-6 py-3.5 font-semibold text-[#1a1408] shadow-2xl lg:hidden"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount} items
          <span className="rounded-full bg-black/15 px-2.5 py-0.5">
            {rupee(total)}
          </span>
        </button>
      )}

      {/* Mobile cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 flex max-h-[88vh] flex-col rounded-t-3xl border-t border-line bg-ink-2"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h3 className="font-serif text-lg font-semibold text-cream">
                  Order · Table {draftTable}
                </h3>
                <button onClick={() => setCartOpen(false)}>
                  <X className="h-5 w-5 text-muted" />
                </button>
              </div>
              <CartContent
                {...{
                  draftItems,
                  setDraftQty,
                  subtotal,
                  gst,
                  sc,
                  total,
                  draftServiceCharge,
                  toggleSC,
                  draftInstructions,
                  setDraftInstructions,
                  setNoteItem,
                  submit,
                  table: draftTable,
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item note modal */}
      <Modal
        open={!!noteItem}
        onClose={() => setNoteItem(null)}
        title={`Note · ${noteTarget?.name ?? ""}`}
      >
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            {QUICK_NOTES.map((q) => {
              const active = noteTarget?.notes
                ?.split(", ")
                .includes(q);
              return (
                <button
                  key={q}
                  onClick={() => {
                    if (!noteItem) return;
                    const cur = noteTarget?.notes
                      ? noteTarget.notes.split(", ").filter(Boolean)
                      : [];
                    const next = active
                      ? cur.filter((x) => x !== q)
                      : [...cur, q];
                    setItemNotes(noteItem, next.join(", "));
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    active
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-line text-cream/70",
                  )}
                >
                  {q}
                </button>
              );
            })}
          </div>
          <textarea
            value={noteTarget?.notes ?? ""}
            onChange={(e) => noteItem && setItemNotes(noteItem, e.target.value)}
            placeholder="Custom note for kitchen..."
            rows={3}
            className={inputCls}
          />
          <Btn className="w-full" onClick={() => setNoteItem(null)}>
            Save Note
          </Btn>
        </div>
      </Modal>
    </div>
  );
}

function MenuCard({
  item,
  qty,
  onAdd,
  onDec,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onDec: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex gap-3 overflow-hidden rounded-2xl border border-line bg-panel/70 p-3 transition",
        !item.available && "opacity-55",
        qty > 0 && "border-gold/40 ring-1 ring-gold/20",
      )}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-1.5 top-1.5">
          <VegBadge type={item.veg} />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight text-cream">{item.name}</h3>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-gold">{rupee(item.price)}</span>
          {!item.available ? (
            <span className="rounded-full bg-[#e25a5a]/15 px-2.5 py-1 text-[11px] text-[#ff8a8a]">
              Unavailable
            </span>
          ) : qty === 0 ? (
            <button
              onClick={onAdd}
              className="flex items-center gap-1 rounded-lg bg-gold/15 px-3 py-1.5 text-sm font-medium text-gold transition hover:bg-gold/25"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-gold/15 px-1.5 py-1">
              <button
                onClick={onDec}
                className="grid h-7 w-7 place-items-center rounded-md text-gold hover:bg-gold/20"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-5 text-center font-semibold text-cream">{qty}</span>
              <button
                onClick={onAdd}
                className="grid h-7 w-7 place-items-center rounded-md text-gold hover:bg-gold/20"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CartProps {
  draftItems: ReturnType<typeof useStore.getState>["draftItems"];
  setDraftQty: (id: string, q: number) => void;
  subtotal: number;
  gst: number;
  sc: number;
  total: number;
  draftServiceCharge: boolean;
  toggleSC: () => void;
  draftInstructions: string;
  setDraftInstructions: (t: string) => void;
  setNoteItem: (id: string) => void;
  submit: () => void;
  table: number;
}

function CartContent(p: CartProps) {
  return (
    <>
      <div className="hidden items-center justify-between border-b border-line px-5 py-4 lg:flex">
        <h3 className="font-serif text-lg font-semibold text-cream">
          Order Summary
        </h3>
        <span className="rounded-full bg-gold/12 px-3 py-1 text-xs font-medium text-gold">
          Table {p.table}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {p.draftItems.length === 0 ? (
          <div className="grid h-full place-items-center py-16 text-center text-sm text-muted">
            <div>
              <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-line" />
              Add dishes to build the order
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {p.draftItems.map((it) => (
              <div
                key={it.itemId}
                className="rounded-xl border border-line bg-panel/60 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <VegBadge type={it.veg} />
                    <span className="text-sm font-medium text-cream">{it.name}</span>
                  </div>
                  <button
                    onClick={() => p.setDraftQty(it.itemId, 0)}
                    className="text-muted hover:text-[#ff8a8a]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {it.notes && (
                  <p className="mt-1 text-xs italic text-gold/80">— {it.notes}</p>
                )}
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-lg bg-ink px-1.5 py-1">
                    <button
                      onClick={() => p.setDraftQty(it.itemId, it.qty - 1)}
                      className="grid h-6 w-6 place-items-center rounded text-gold hover:bg-gold/20"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-cream">
                      {it.qty}
                    </span>
                    <button
                      onClick={() => p.setDraftQty(it.itemId, it.qty + 1)}
                      className="grid h-6 w-6 place-items-center rounded text-gold hover:bg-gold/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => p.setNoteItem(it.itemId)}
                      className="flex items-center gap-1 text-xs text-muted hover:text-gold"
                    >
                      <StickyNote className="h-3.5 w-3.5" /> Note
                    </button>
                    <span className="text-sm font-semibold text-cream">
                      {rupee(it.price * it.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <textarea
              value={p.draftInstructions}
              onChange={(e) => p.setDraftInstructions(e.target.value)}
              placeholder="Special instructions for the whole table..."
              rows={2}
              className={inputCls + " mt-2 text-sm"}
            />
          </div>
        )}
      </div>

      {p.draftItems.length > 0 && (
        <div className="border-t border-line px-5 py-4">
          <div className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={rupee(p.subtotal)} />
            <Row label={`GST (${RESTAURANT.gstRate * 100}%)`} value={rupee(p.gst)} />
            <div className="flex items-center justify-between">
              <button
                onClick={p.toggleSC}
                className="flex items-center gap-2 text-cream/70"
              >
                <span
                  className={cn(
                    "grid h-4 w-4 place-items-center rounded border",
                    p.draftServiceCharge
                      ? "border-gold bg-gold text-[#1a1408]"
                      : "border-line",
                  )}
                >
                  {p.draftServiceCharge && "✓"}
                </span>
                Service charge ({RESTAURANT.serviceChargeRate * 100}%)
              </button>
              <span className="text-cream/80">{rupee(p.sc)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-line pt-2.5">
              <span className="font-serif text-lg font-semibold text-cream">
                Grand Total
              </span>
              <span className="font-serif text-xl font-bold text-gold">
                {rupee(p.total)}
              </span>
            </div>
          </div>
          <Btn className="mt-4 w-full py-3.5 text-base" onClick={p.submit}>
            <Send className="h-4 w-4" /> Send to Kitchen
          </Btn>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-cream/70">
      <span>{label}</span>
      <span className="text-cream/80">{value}</span>
    </div>
  );
}
