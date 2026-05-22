"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Save, Eye, EyeOff, Loader2 } from "lucide-react";

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  deliveryRadiusKm: number;
  deliveryFee: number;
  estimatedTimeMinutes: number;
  mercadoPagoAccessToken?: string;
}

export function SettingsPanel({ restaurant, ownerId }: { restaurant: Restaurant; ownerId: string }) {
  const [form, setForm] = useState({
    deliveryRadiusKm: restaurant.deliveryRadiusKm,
    deliveryFee: restaurant.deliveryFee,
    estimatedTimeMinutes: restaurant.estimatedTimeMinutes,
    mercadoPagoAccessToken: restaurant.mercadoPagoAccessToken || "",
    description: restaurant.description,
  });
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSettings = useMutation(api.restaurants.updateRestaurantSettings);

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings({
        restaurantId: restaurant._id as Id<"restaurants">,
        ownerId,
        deliveryRadiusKm: form.deliveryRadiusKm,
        deliveryFee: form.deliveryFee,
        estimatedTimeMinutes: form.estimatedTimeMinutes,
        mercadoPagoAccessToken: form.mercadoPagoAccessToken || undefined,
        description: form.description,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
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

      {/* Description */}
      <section className="glass-card p-4">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Descrição do Restaurante
        </h2>
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
      </section>

      {/* Mercado Pago */}
      <section className="glass-card p-4">
        <h2 className="font-semibold mb-1 text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Mercado Pago
        </h2>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
          Cole aqui o seu Access Token para receber os pagamentos diretamente na sua conta.
          Encontre em{" "}
          <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-orange)" }}>
            mercadopago.com.br/developers
          </a>
        </p>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            value={form.mercadoPagoAccessToken}
            onChange={(e) => setForm((p) => ({ ...p, mercadoPagoAccessToken: e.target.value }))}
            placeholder="APP_USR-xxxxxxxx..."
            className="w-full pl-3 pr-10 py-2.5 rounded-xl text-sm outline-none font-mono"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          <button
            onClick={() => setShowToken(!showToken)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-muted)" }}
          >
            {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
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
