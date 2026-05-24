"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Save, Eye, EyeOff, Loader2, Copy, Download, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  deliveryRadiusKm: number;
  deliveryFee: number;
  estimatedTimeMinutes: number;
  mercadoPagoAccessToken?: string;
  state?: string;
  city?: string;
  citySlug?: string;
  restaurantSlug?: string;
}

export function SettingsPanel({ restaurant, ownerId }: { restaurant: Restaurant & { imageUrl?: string }; ownerId: string }) {
  const [form, setForm] = useState({
    deliveryRadiusKm: restaurant.deliveryRadiusKm,
    deliveryFee: restaurant.deliveryFee,
    estimatedTimeMinutes: restaurant.estimatedTimeMinutes,
    mercadoPagoAccessToken: restaurant.mercadoPagoAccessToken || "",
    description: restaurant.description,
    state: restaurant.state || "",
    city: restaurant.city || "",
  });
  
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(restaurant.imageUrl || null);

  const updateSettings = useMutation(api.restaurants.updateRestaurantSettings);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200; // Slightly larger for restaurant banner
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
          0.85
        );
      };
      img.onerror = (err) => reject(err);
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      let storageId: Id<"_storage"> | undefined;

      if (selectedFile) {
        const compressedBlob = await compressImage(selectedFile);
        const uploadUrl = await generateUploadUrl();
        
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: compressedBlob,
        });

        if (!result.ok) throw new Error("Falha no upload da imagem");
        const { storageId: uploadedStorageId } = await result.json();
        storageId = uploadedStorageId;
      }

      await updateSettings({
        restaurantId: restaurant._id as Id<"restaurants">,
        ownerId,
        deliveryRadiusKm: form.deliveryRadiusKm,
        deliveryFee: form.deliveryFee,
        estimatedTimeMinutes: form.estimatedTimeMinutes,
        mercadoPagoAccessToken: form.mercadoPagoAccessToken || undefined,
        description: form.description,
        state: form.state || undefined,
        city: form.city || undefined,
        storageId: storageId,
        imageUrl: !selectedFile ? restaurant.imageUrl : undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cover Image */}
      <section className="glass-card p-4">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Foto de Capa do Restaurante
        </h2>
        <div className="flex flex-col gap-4">
          {previewUrl && (
            <div className="w-full h-40 rounded-xl overflow-hidden" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
              <img src={previewUrl} alt="Capa" className="w-full h-full object-cover" />
            </div>
          )}
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
      </section>

      {/* Delivery settings */}
      <section className="glass-card p-4">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Configurações de Entrega
        </h2>
        <div className="flex flex-col gap-4">
          <NumberField
            label="Raio de entrega (km)"
            value={form.deliveryRadiusKm}
            onChange={(v) => setForm((p) => ({ ...p, deliveryRadiusKm: v }))}
            min={1}
            max={50}
            step={0.5}
          />
          <NumberField
            label="Taxa de entrega (R$)"
            value={form.deliveryFee}
            onChange={(v) => setForm((p) => ({ ...p, deliveryFee: v }))}
            min={0}
            step={0.5}
            prefix="R$"
          />
          <NumberField
            label="Tempo estimado (minutos)"
            value={form.estimatedTimeMinutes}
            onChange={(v) => setForm((p) => ({ ...p, estimatedTimeMinutes: v }))}
            min={5}
            max={120}
            step={5}
            suffix="min"
          />
        </div>
      </section>

      {/* Description & Address */}
      <section className="glass-card p-4">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Sobre o Restaurante
        </h2>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>Estado (UF)</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                placeholder="Ex: SP"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>Cidade</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                placeholder="Ex: São Paulo"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
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
      </section>

      {/* Mercado Pago */}
      <section className="glass-card p-4">
        <h2 className="font-semibold mb-1 text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Mercado Pago
        </h2>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
          Conecte sua conta do Mercado Pago para receber os pagamentos online automaticamente.
        </p>
        
        {restaurant.mercadoPagoAccessToken ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#22c55e" }}>Conta Conectada</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Pronto para receber pagamentos</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID;
                if (!clientId) {
                  alert("A configuração do Mercado Pago não está completa no servidor (Falta o NEXT_PUBLIC_MP_CLIENT_ID).");
                  return;
                }
                const redirectUri = encodeURIComponent(`${window.location.origin}/api/mercadopago/callback`);
                const mpUrl = `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${restaurant._id}&redirect_uri=${redirectUri}`;
                window.location.href = mpUrl;
              }}
              className="text-xs font-semibold underline text-center opacity-70 hover:opacity-100"
            >
              Reconectar conta diferente
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID;
              if (!clientId) {
                alert("A configuração do Mercado Pago não está completa no servidor (Falta o NEXT_PUBLIC_MP_CLIENT_ID).");
                return;
              }
              const redirectUri = encodeURIComponent(`${window.location.origin}/api/mercadopago/callback`);
              const mpUrl = `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${restaurant._id}&redirect_uri=${redirectUri}`;
              window.location.href = mpUrl;
            }}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: "#009ee3", color: "white" }}
          >
            Conectar com Mercado Pago
          </button>
        )}
      </section>

      {/* Share & QR Code */}
      <section className="glass-card p-4">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
          <Share2 size={16} /> Link Direto e QR Code
        </h2>
        
        {(() => {
          const origin = typeof window !== "undefined" ? window.location.origin : "https://delivery.foodpronto.com.br";
          const state = restaurant.state?.toLowerCase() || "sp";
          const city = restaurant.citySlug || "cidade";
          const slug = restaurant.restaurantSlug || restaurant._id;
          const shareUrl = `${origin}/${state}/${city}/${slug}`;
          
          return (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>Seu link de delivery</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none font-mono opacity-80"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert("Link copiado para a área de transferência!");
                    }}
                    className="px-4 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                    title="Copiar Link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                  Compartilhe este link no seu Instagram, WhatsApp ou Facebook para que seus clientes peçam direto no seu cardápio.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-xl" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
                  <QRCodeCanvas 
                    id="restaurant-qr-code"
                    value={shareUrl} 
                    size={150} 
                    level="H"
                    includeMargin={true}
                    fgColor="#000000"
                  />
                </div>
                <button
                  onClick={() => {
                    const canvas = document.getElementById("restaurant-qr-code") as HTMLCanvasElement;
                    if (canvas) {
                      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                      let downloadLink = document.createElement("a");
                      downloadLink.href = pngUrl;
                      downloadLink.download = `QR-Code-${restaurant.name.replace(/\s+/g, '-')}.png`;
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{ background: "var(--color-orange)", color: "white" }}
                >
                  <Download size={16} />
                  Baixar QR Code
                </button>
                <p className="text-xs mt-3 text-center px-4" style={{ color: "var(--color-text-muted)" }}>
                  Imprima este QR Code e coloque nas suas mesas, embalagens ou panfletos!
                </p>
              </div>
            </div>
          );
        })()}
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-orange flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={16} className="animate-spin" />
        ) : saved ? (
          "✓ Salvo!"
        ) : (
          <>
            <Save size={16} />
            Salvar configurações
          </>
        )}
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm" style={{ color: "var(--color-text-muted)" }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            paddingLeft: prefix ? "2.5rem" : "0.75rem",
            paddingRight: suffix ? "3rem" : "0.75rem",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
        {suffix && (
          <span className="absolute right-3 text-sm" style={{ color: "var(--color-text-muted)" }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}
