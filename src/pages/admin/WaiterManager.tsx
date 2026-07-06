import { useState } from "react";
import { Plus, Pencil, Trash2, KeyRound, Phone } from "lucide-react";
import { useStore } from "../../lib/store";
import { Btn, Card, Modal, Field, inputCls } from "../../components/ui";
import { cn, rupee, isThisMonth, sumTotals } from "../../lib/utils";
import type { User } from "../../lib/types";

const emptyWaiter = {
  name: "",
  username: "",
  password: "waiter123",
  phone: "",
  active: true,
  shift: "Evening",
};

export default function WaiterManager() {
  const users = useStore((s) => s.users);
  const orders = useStore((s) => s.orders);
  const addWaiter = useStore((s) => s.addWaiter);
  const updateWaiter = useStore((s) => s.updateWaiter);
  const deleteWaiter = useStore((s) => s.deleteWaiter);
  const resetPassword = useStore((s) => s.resetPassword);

  const waiters = users.filter((u) => u.role === "waiter");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [draft, setDraft] = useState({ ...emptyWaiter });
  const [pwModal, setPwModal] = useState<User | null>(null);
  const [newPw, setNewPw] = useState("");

  const stats = (id: string) => {
    const o = orders.filter((x) => x.waiterId === id && x.paid && isThisMonth(x.completedAt ?? x.createdAt));
    return { count: o.length, sales: sumTotals(o) };
  };

  const openNew = () => {
    setEditing(null);
    setDraft({ ...emptyWaiter });
    setModal(true);
  };
  const openEdit = (u: User) => {
    setEditing(u);
    setDraft({
      name: u.name,
      username: u.username,
      password: u.password,
      phone: u.phone ?? "",
      active: u.active,
      shift: u.shift ?? "Evening",
    });
    setModal(true);
  };
  const save = () => {
    if (!draft.name.trim() || !draft.username.trim()) return;
    if (editing) updateWaiter(editing.id, draft);
    else addWaiter(draft);
    setModal(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
            Waiter Management
          </h1>
          <p className="text-sm text-muted">{waiters.length} staff members</p>
        </div>
        <Btn onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Waiter
        </Btn>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {waiters.map((w) => {
          const st = stats(w.id);
          return (
            <Card key={w.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold/15 font-serif text-xl font-semibold text-gold">
                  {w.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-cream">{w.name}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        w.active
                          ? "bg-[#5fd28e]/15 text-[#5fd28e]"
                          : "bg-[#e25a5a]/15 text-[#ff8a8a]",
                      )}
                    >
                      {w.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-muted">@{w.username} · {w.shift} shift</p>
                  {w.phone && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Phone className="h-3 w-3" /> {w.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-ink/60 p-3">
                <div>
                  <p className="text-xs text-muted">Orders (month)</p>
                  <p className="font-semibold text-cream">{st.count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Sales (month)</p>
                  <p className="font-semibold text-gold">{rupee(st.sales)}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => openEdit(w)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-xs text-cream/70 hover:text-gold"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    setPwModal(w);
                    setNewPw("");
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-xs text-cream/70 hover:text-gold"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Reset
                </button>
                <button
                  onClick={() => deleteWaiter(w.id)}
                  className="grid w-9 place-items-center rounded-lg border border-line text-cream/60 hover:text-[#ff8a8a]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Waiter" : "Add Waiter"}
      >
        <div className="space-y-4 p-6">
          <Field label="Full Name">
            <input
              className={inputCls}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Username">
              <input
                className={inputCls}
                value={draft.username}
                onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <input
                className={inputCls}
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Shift">
              <select
                className={inputCls}
                value={draft.shift}
                onChange={(e) => setDraft({ ...draft, shift: e.target.value })}
              >
                {["Morning", "Afternoon", "Evening", "Night"].map((s) => (
                  <option key={s} className="bg-ink">{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <button
                onClick={() => setDraft({ ...draft, active: !draft.active })}
                className={cn(
                  "w-full rounded-xl border py-3 text-sm font-medium",
                  draft.active
                    ? "border-[#5fd28e]/50 bg-[#5fd28e]/12 text-[#5fd28e]"
                    : "border-[#e25a5a]/50 bg-[#e25a5a]/12 text-[#ff8a8a]",
                )}
              >
                {draft.active ? "Active" : "Inactive"}
              </button>
            </Field>
          </div>
          {!editing && (
            <Field label="Password">
              <input
                className={inputCls}
                value={draft.password}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              />
            </Field>
          )}
          <Btn className="w-full py-3" onClick={save}>
            {editing ? "Save Changes" : "Add Waiter"}
          </Btn>
        </div>
      </Modal>

      <Modal
        open={!!pwModal}
        onClose={() => setPwModal(null)}
        title={`Reset Password · ${pwModal?.name ?? ""}`}
      >
        <div className="space-y-4 p-6">
          <Field label="New Password">
            <input
              className={inputCls}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Enter new password"
            />
          </Field>
          <Btn
            className="w-full py-3"
            onClick={() => {
              if (pwModal && newPw.trim()) {
                resetPassword(pwModal.id, newPw);
                setPwModal(null);
              }
            }}
          >
            Reset Password
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
