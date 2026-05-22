"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  category?: string;
}

export function MenuManager({ restaurantId }: { restaurantId: Id<"restaurants"> }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const menuItems = useQuery(api.menuItems.getAllMenuItems, { restaurantId });
  const addItem = useMutation(api.menuItems.addMenuItem);
  const updateItem = useMutation(api.menuItems.updateMenuItem);
  const deleteItem = useMutation(api.menuItems.deleteMenuItem);

  const categories = menuItems
    ? [...new Set(menuItems.map((i) => i.category || "Sem categoria"))]
    : [];

  async function handleToggleAvailable(item: MenuItem) {
    await updateItem({ menuItemId: item._id as Id<"menuItems">, isAvailable: !item.isAvailable });
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Remover este item?")) return;
    await deleteItem({ menuItemId: itemId as Id<"menuItems"> });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold">
          {menuItems?.length ?? 0} itens no cardápio
        </h2>
        <button
          onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="btn-orange flex items-center gap-2 text-sm py-2.5 px-4"
        >
          <Plus size={16} />
          Adicionar item
        </button>
      </div>

      {/* Item form modal */}
      {showForm && (
        <ItemForm
          restaurantId={restaurantId}
          editingItem={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSave={async (data) => {
            if (editingItem) {
              await updateItem({ menuItemId: editingItem._id as Id<"menuItems">, ...data });
            } else {
              await addItem({ restaurantId, ...data });
            }
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Items list */}
      {menuItems === undefined && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
        </div>
      )}

      {menuItems?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🍽️</div>
          <p style={{ color: "var(--color-text-muted)" }}>Seu cardápio está vazio. Adicione o primeiro item!</p>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat} className="mb-6">
          <h3 className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: "var(--color-text-muted)" }}>
            {cat}
          </h3>
          <div className="flex flex-col gap-2">
            {menuItems
              ?.filter((i) => (i.category || "Sem categoria") === cat)
              .map((item) => (
                <div
                  key={item._id}
                  className="glass-card p-3 flex items-center gap-3"
                  style={{ opacity: item.isAvailable ? 1 : 0.6 }}
                >
                  {item.imageUrl && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--color-surface-2)" }}>
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{item.description}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: "var(--color-orange)" }}>
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleAvailable(item)} style={{ color: item.isAvailable ? "#22c55e" : "var(--color-text-muted)" }}>
                      {item.isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <button
                      onClick={() => { setEditingItem(item); setShowForm(true); }}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} style={{ color: "#ef4444" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemForm({
  restaurantId,
  editingItem,
  onClose,
  onSave,
}: {
  restaurantId: Id<"restaurants">;
  editingItem: MenuItem | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: editingItem?.name || "",
    description: editingItem?.description || "",
    price: editingItem?.price || 0,
    imageUrl: editingItem?.imageUrl || "",
    category: editingItem?.category || "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl || undefined,
        category: form.category || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-t-2xl p-5 pb-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">{editingItem ? "Editar item" : "Novo item"}</h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: "Nome *", key: "name", placeholder: "Ex: X-Burguer Especial" },
            { label: "Descrição", key: "description", placeholder: "Ingredientes, modo de preparo..." },
            { label: "Categoria", key: "category", placeholder: "Ex: Lanches, Bebidas, Sobremesas" },
            { label: "URL da imagem", key: "imageUrl", placeholder: "https://..." },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>{label}</label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          ))}

          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Preço (R$) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              min={0}
              step={0.5}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.name || !form.price || saving}
          className="btn-orange w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : editingItem ? "Salvar alterações" : "Adicionar ao cardápio"}
        </button>
      </div>
    </div>
  );
}
