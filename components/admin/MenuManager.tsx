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
  variations?: { name: string; price: number }[];
}

export function MenuManager({ restaurantId }: { restaurantId: Id<"restaurants"> }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const menuItems = useQuery(api.menuItems.getAllMenuItems, { restaurantId });
  const addItem = useMutation(api.menuItems.addMenuItem);
  const updateItem = useMutation(api.menuItems.updateMenuItem);
  const deleteItem = useMutation(api.menuItems.deleteMenuItem);

  const categories = menuItems
    ? [...new Set(menuItems.map((i: any) => i.category || "Sem categoria"))]
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
              ?.filter((i: any) => (i.category || "Sem categoria") === cat)
              .map((item: any) => (
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
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="text-sm font-bold" style={{ color: "var(--color-orange)" }}>
                        {item.variations && item.variations.length > 0 
                          ? `A partir de R$ ${Math.min(...item.variations.map((v: any) => v.price)).toFixed(2)}`
                          : `R$ ${item.price.toFixed(2)}`}
                      </p>
                      {item.variations && item.variations.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(249, 115, 22, 0.1)", color: "var(--color-orange)" }}>
                          {item.variations.length} variações
                        </span>
                      )}
                    </div>
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
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const [form, setForm] = useState({
    name: editingItem?.name || "",
    description: editingItem?.description || "",
    price: editingItem?.price || 0,
    category: editingItem?.category || "",
  });
  
  const [variations, setVariations] = useState<{name: string; price: number}[]>(editingItem?.variations || []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(editingItem?.imageUrl || null);
  const [saving, setSaving] = useState(false);

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Falha na compressão da imagem"));
          },
          "image/jpeg",
          0.8 // 80% quality
        );
      };
      img.onerror = (err) => reject(err);
    });
  }

  async function handleSubmit() {
    if (!form.name || (!form.price && variations.length === 0)) return;
    
    // Clean up empty variations
    const cleanVariations = variations.filter(v => v.name.trim() !== "");
    
    setSaving(true);
    try {
      let storageId: Id<"_storage"> | undefined;

      if (selectedFile) {
        // 1. Compress image
        const compressedBlob = await compressImage(selectedFile);
        
        // 2. Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();
        
        // 3. Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: compressedBlob,
        });

        if (!result.ok) throw new Error("Falha no upload da imagem");
        const { storageId: uploadedStorageId } = await result.json();
        storageId = uploadedStorageId;
      }

      await onSave({
        name: form.name,
        description: form.description,
        price: cleanVariations.length > 0 ? cleanVariations[0].price : Number(form.price),
        category: form.category || undefined,
        variations: cleanVariations.length > 0 ? cleanVariations : undefined,
        storageId: storageId,
        imageUrl: !selectedFile ? editingItem?.imageUrl : undefined, 
      });
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-t-2xl p-5 pb-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">{editingItem ? "Editar item" : "Novo item"}</h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* File Upload / Preview */}
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>Imagem do prato</label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-orange)] file:text-white hover:file:opacity-80 transition-all cursor-pointer"
                  style={{ color: "var(--color-text-muted)" }}
                />
              </div>
            </div>
          </div>

          {[
            { label: "Nome *", key: "name", placeholder: "Ex: X-Burguer Especial" },
            { label: "Descrição", key: "description", placeholder: "Ingredientes, modo de preparo..." },
            { label: "Categoria", key: "category", placeholder: "Ex: Lanches, Bebidas, Sobremesas" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>{label}</label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
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

          {/* Variações */}
          <div className="pt-2 border-t border-dashed" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Variações (Tamanhos/Opções)</label>
              <button 
                onClick={() => setVariations([...variations, { name: "", price: 0 }])}
                className="text-xs px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors"
                style={{ background: "rgba(249, 115, 22, 0.1)", color: "var(--color-orange)" }}
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
            
            {variations.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {variations.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: Pequena" 
                      value={v.name}
                      onChange={(e) => {
                        const newVars = [...variations];
                        newVars[idx].name = e.target.value;
                        setVariations(newVars);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                    />
                    <input 
                      type="number" 
                      placeholder="Preço" 
                      value={v.price}
                      min={0}
                      step={0.5}
                      onChange={(e) => {
                        const newVars = [...variations];
                        newVars[idx].price = Number(e.target.value);
                        setVariations(newVars);
                      }}
                      className="w-24 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                    />
                    <button 
                      onClick={() => setVariations(variations.filter((_, i) => i !== idx))}
                      style={{ color: "#ef4444" }}
                      className="p-2 opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preço Fixo (só mostra se não houver variações) */}
          {variations.length === 0 && (
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>Preço Fixo (R$) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                min={0}
                step={0.5}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.name || (!form.price && variations.length === 0) || saving}
          className="btn-orange w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : editingItem ? "Salvar alterações" : "Adicionar ao cardápio"}
        </button>
      </div>
    </div>
  );
}
