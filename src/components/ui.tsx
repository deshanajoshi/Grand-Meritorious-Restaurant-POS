import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import type { VegType } from "../lib/types";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "grid place-items-center rounded-xl bg-gradient-to-br from-[#c79a45] to-[#8a6a2e] font-serif font-bold text-white shadow-md shadow-[#a9823a]/30",
          size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg",
        )}
      >
        GM
      </div>
      <div className="leading-none">
        <div className={cn("font-serif font-semibold tracking-tight text-cream", dims)}>
          Grand <span className="gold-text">Meritorious</span>
        </div>
        {size !== "sm" && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted">
              Fine Dining · Est. 1998
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[#5fd28e]/40 bg-[#5fd28e]/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#5fd28e]">
              <span className="grid h-2.5 w-2.5 place-items-center rounded-[2px] border border-[#5fd28e]">
                <span className="h-1 w-1 rounded-full bg-[#5fd28e]" />
              </span>
              Pure Veg
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function VegBadge({ type, size = "sm" }: { type: VegType; size?: "sm" | "md" }) {
  const color = type === "veg" ? "#5fd28e" : "#e25a5a";
  const dim = size === "md" ? 18 : 14;
  return (
    <span
      title={type === "veg" ? "Vegetarian" : "Non-Vegetarian"}
      className="grid place-items-center rounded-[3px]"
      style={{ width: dim, height: dim, border: `1.5px solid ${color}` }}
    >
      <span
        className="rounded-full"
        style={{ width: dim * 0.45, height: dim * 0.45, background: color }}
      />
    </span>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 select-none active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none";
  const variants = {
    primary:
      "bg-gradient-to-br from-[#f3d488] to-[#bf9444] text-[#1a1408] shadow-lg shadow-[#bf9444]/20 hover:brightness-110",
    ghost: "text-cream/80 hover:text-cream hover:bg-white/5",
    outline:
      "gold-border text-gold hover:bg-gold/10",
    danger: "bg-[#e25a5a]/15 text-[#ff8a8a] hover:bg-[#e25a5a]/25",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-panel/70 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatPill({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: ReactNode;
  accent: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted">
            {label}
          </div>
          <div className="mt-1.5 text-2xl font-bold sm:text-3xl" style={{ color: accent }}>
            {value}
          </div>
        </div>
        {icon && (
          <div
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{ background: accent + "1a", color: accent }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function Modal({
  open,
  onClose,
  children,
  title,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-t-3xl border border-line bg-ink-2 shadow-2xl animate-fade-up sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 className="font-serif text-xl font-semibold text-cream">{title}</h3>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-cream"
            >
              ✕
            </button>
          </div>
        )}
        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-ink px-4 py-3 text-cream placeholder:text-muted/60 outline-none transition focus:border-gold/60";
