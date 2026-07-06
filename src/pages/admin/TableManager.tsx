import { useState } from "react";
import { Plus, Trash2, Users, Minus } from "lucide-react";
import { useStore } from "../../lib/store";
import { Btn, Card, Modal, Field, inputCls } from "../../components/ui";
import { TABLE_META } from "../../lib/utils";

export default function TableManager() {
  const tables = useStore((s) => s.tables);
  const addTable = useStore((s) => s.addTable);
  const updateTable = useStore((s) => s.updateTable);
  const deleteTable = useStore((s) => s.deleteTable);

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [capacity, setCapacity] = useState(4);

  const openNew = () => {
    setEditId(null);
    setCapacity(4);
    setModal(true);
  };
  const openEdit = (id: string, cap: number) => {
    setEditId(id);
    setCapacity(cap);
    setModal(true);
  };
  const save = () => {
    if (editId) updateTable(editId, { capacity });
    else addTable(capacity);
    setModal(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
            Table Management
          </h1>
          <p className="text-sm text-muted">{tables.length} tables configured</p>
        </div>
        <Btn onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Table
        </Btn>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tables
          .sort((a, b) => a.number - b.number)
          .map((t) => {
            const m = TABLE_META[t.status];
            return (
              <Card key={t.id} className="p-4">
                <div className="flex items-start justify-between">
                  <span className="font-serif text-2xl font-bold text-cream">
                    {t.number}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: m.bg, color: m.color }}
                  >
                    {m.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-cream/60">
                  <Users className="h-4 w-4" /> {t.capacity} seats
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEdit(t.id, t.capacity)}
                    className="flex-1 rounded-lg border border-line py-1.5 text-xs text-cream/70 hover:text-gold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTable(t.id)}
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
        title={editId ? "Edit Table" : "Add Table"}
      >
        <div className="space-y-5 p-6">
          <Field label="Seating Capacity">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCapacity(Math.max(1, capacity - 1))}
                className="grid h-12 w-12 place-items-center rounded-xl border border-line text-gold"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="w-16 text-center font-serif text-4xl font-bold text-cream">
                {capacity}
              </span>
              <button
                onClick={() => setCapacity(capacity + 1)}
                className="grid h-12 w-12 place-items-center rounded-xl border border-line text-gold"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </Field>
          <div className="flex gap-2">
            {[2, 4, 6, 8].map((c) => (
              <button
                key={c}
                onClick={() => setCapacity(c)}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm text-cream/70 hover:border-gold/50"
              >
                {c} seats
              </button>
            ))}
          </div>
          <Btn className="w-full py-3" onClick={save}>
            {editId ? "Save Changes" : "Add Table"}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
