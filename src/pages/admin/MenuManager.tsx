import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FolderPlus,
  Tags,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Btn, Card, Modal, Field, inputCls, VegBadge } from "../../components/ui";
import { rupee, cn } from "../../lib/utils";
import type { MenuItem } from "../../lib/types";

const FOOD_IMAGES = [
  "/food/paneer-tikka.jpg",
  "/food/tomato-soup.jpg",
  "/food/pizza.jpg",
  "/food/burger.jpg",
  "/food/sandwich.jpg",
  "/food/pasta.jpg",
  "/food/noodles.jpg",
  "/food/dosa.jpg",
  "/food/butter-chicken.jpg",
  "/food/thali.jpg",
  "/food/biryani.jpg",
  "/food/naan.jpg",
  "/food/lassi.jpg",
  "/food/lava-cake.jpg",
  "/food/ice-cream.jpg",
];

const empty = (cat: string): Omit<MenuItem, "id"> => ({
  name: "",
  description: "",
  price: 0,
  category: cat,
  veg: "veg",
  available: true,
  image: FOOD_IMAGES[0],
  popular: 0,
});

export default function MenuManager() {
  const menu = useStore((s) => s.menu);
  const categories = useStore((s) => s.categories);
  const addItem = useStore((s) => s.addMenuItem);
  const updateItem = useStore((s) => s.updateMenuItem);
  const deleteItem = useStore((s) => s.deleteMenuItem);
  const addCategory = useStore((s) => s.addCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);

  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<Omit<MenuItem, "id"> | null>(null);
  const [catModal, setCatModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", icon: "🍽️" });
  const [uploadFile, setUploadFile] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      menu.filter(
        (m) =>
          (cat === "all" || m.category === cat) &&
          (!search || m.name.toLowerCase().includes(search.toLowerCase())),
      ),
    [menu, cat, search],
  );

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  const openNew = () => {
    setEditing(null);
    setDraft(empty(cat === "all" ? categories[0]?.id ?? "starters" : cat));
    setUploadFile(null);
  };
  const openEdit = (m: MenuItem) => {
    setEditing(m);
    setDraft({ ...m });
    setUploadFile(null);
  };

  const save = () => {
    if (!draft || !draft.name.trim()) return;
    const final = uploadFile ? { ...draft, image: uploadFile } : draft;
    if (editing) updateItem(editing.id, final);
    else addItem(final);
    setDraft(null);
    setEditing(null);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setUploadFile(reader.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
            Menu Management
          </h1>
          <p className="text-sm text-muted">{menu.length} dishes across {categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => setCatModal(true)}>
            <Tags className="h-4 w-4" /> Categories
          </Btn>
          <Btn onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Item
          </Btn>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className={inputCls + " pl-10"}
          />
        </div>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCat("all")}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition",
            cat === "all" ? "bg-gold/15 text-gold" : "text-cream/55",
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
              cat === c.id ? "bg-gold/15 text-gold" : "text-cream/55",
            )}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id} className="flex gap-3 p-3">
            <img
              src={m.image}
              alt={m.name}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start gap-2">
                <VegBadge type={m.veg} />
                <span className="font-medium leading-tight text-cream">{m.name}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{catName(m.category)}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="font-semibold text-gold">{rupee(m.price)}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateItem(m.id, { available: !m.available })}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      m.available
                        ? "bg-[#5fd28e]/15 text-[#5fd28e]"
                        : "bg-[#e25a5a]/15 text-[#ff8a8a]",
                    )}
                  >
                    {m.available ? "Available" : "Off"}
                  </button>
                  <button
                    onClick={() => openEdit(m)}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-line text-cream/60 hover:text-gold"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteItem(m.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-line text-cream/60 hover:text-[#ff8a8a]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Item editor */}
      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={editing ? "Edit Item" : "Add Menu Item"}
        wide
      >
        {draft && (
          <div className="space-y-4 p-6">
            <Field label="Item Name">
              <input
                className={inputCls}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Paneer Tikka"
              />
            </Field>
            <Field label="Description">
              <textarea
                className={inputCls}
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (₹)">
                <input
                  type="number"
                  className={inputCls}
                  value={draft.price || ""}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                />
              </Field>
              <Field label="Category">
                <select
                  className={inputCls}
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-ink">
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Availability">
              <button
                onClick={() => setDraft({ ...draft, available: !draft.available })}
                className={cn(
                  "w-full rounded-xl border py-2.5 text-sm font-medium",
                  draft.available
                    ? "border-[#5fd28e]/50 bg-[#5fd28e]/12 text-[#5fd28e]"
                    : "border-[#e25a5a]/50 bg-[#e25a5a]/12 text-[#ff8a8a]",
                )}
              >
                {draft.available ? "Available" : "Unavailable"}
              </button>
            </Field>
            <Field label="Food Image">
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {FOOD_IMAGES.map((img) => (
                    <button
                      key={img}
                      onClick={() => {
                        setDraft({ ...draft, image: img });
                        setUploadFile(null);
                      }}
                      className={cn(
                        "overflow-hidden rounded-lg border-2 transition",
                        draft.image === img && !uploadFile
                          ? "border-gold"
                          : "border-transparent opacity-70",
                      )}
                    >
                      <img src={img} className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm text-cream/60 hover:border-gold/50">
                  <Plus className="h-4 w-4" /> Upload custom image
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
                {uploadFile && (
                  <img src={uploadFile} className="h-24 w-24 rounded-lg object-cover ring-2 ring-gold" />
                )}
              </div>
            </Field>
            <Btn className="w-full py-3" onClick={save}>
              {editing ? "Save Changes" : "Add to Menu"}
            </Btn>
          </div>
        )}
      </Modal>

      {/* Category manager */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title="Categories">
        <div className="space-y-4 p-6">
          <div className="flex gap-2">
            <input
              className={inputCls + " w-16 text-center"}
              value={newCat.icon}
              onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
            />
            <input
              className={inputCls + " flex-1"}
              placeholder="New category name"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
            />
            <Btn
              onClick={() => {
                if (newCat.name.trim()) {
                  addCategory(newCat.name, newCat.icon || "🍽️");
                  setNewCat({ name: "", icon: "🍽️" });
                }
              }}
            >
              <FolderPlus className="h-4 w-4" />
            </Btn>
          </div>
          <div className="space-y-1.5">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-line bg-panel/60 px-4 py-2.5"
              >
                <span className="text-cream">
                  {c.icon} {c.name}
                </span>
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="text-muted hover:text-[#ff8a8a]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
