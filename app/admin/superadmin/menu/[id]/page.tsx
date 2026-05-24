"use client";

import { MenuManager } from "@/components/admin/MenuManager";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, UtensilsCrossed, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function SuperAdminRestaurantPage() {
  const params = useParams();
  const restaurantId = params.id as Id<"restaurants">;
  
  const [activeTab, setActiveTab] = useState<"menu" | "settings">("menu");

  const restaurant = useQuery(api.restaurants.getRestaurant, { restaurantId });

  if (restaurant === undefined) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-orange)]" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Restaurante não encontrado</h1>
        <Link href="/admin/superadmin" className="text-[var(--color-orange)] underline">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Link href="/admin/superadmin" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4">
            <ArrowLeft size={16} />
            Voltar para Super Admin
          </Link>
          <h1 className="text-2xl font-bold">Gerenciar {restaurant.name}</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Adicione o cardápio e configure o restaurante para o cliente.</p>
        </div>

        {/* Tab nav */}
        <nav className="mb-6 px-1 flex gap-2">
          {[
            { key: "menu", label: "Cardápio", icon: UtensilsCrossed },
            { key: "settings", label: "Configurações e Imagem", icon: Settings },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === key
                  ? { background: "var(--color-orange-glow)", color: "var(--color-orange)" }
                  : { color: "var(--color-text-muted)", background: "var(--color-surface-2)" }
              }
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {activeTab === "menu" && (
          <MenuManager restaurantId={restaurantId} />
        )}
        {activeTab === "settings" && (
          <SettingsPanel restaurant={restaurant as any} ownerId={restaurant.ownerId} />
        )}
      </div>
    </div>
  );
}
