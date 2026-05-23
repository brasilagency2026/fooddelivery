"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { OrderCard } from "@/components/order/OrderCard";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { MenuManager } from "@/components/admin/MenuManager";
import { RegisterRestaurant } from "@/components/admin/RegisterRestaurant";
import { LayoutDashboard, UtensilsCrossed, Settings, Power } from "lucide-react";
import { useAudioNotification } from "@/hooks/useAudioNotification";
import { useEffect, useRef } from "react";

type Tab = "orders" | "menu" | "settings";

export default function AdminDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const { playSound } = useAudioNotification();
  const prevPendingCountRef = useRef<number>(0);

  const restaurant = useQuery(
    api.restaurants.getMyRestaurant,
    user ? { ownerId: user.id } : "skip"
  );

  const activeOrders = useQuery(
    api.orders.getActiveOrders,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const pendingCount = activeOrders?.filter((o: any) => o.status === "pending").length ?? 0;

  const { playSound, isAudioUnlocked, unlockAudio } = useAudioNotification();
  const prevPendingCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeOrders !== undefined) {
      if (prevPendingCountRef.current !== null && pendingCount > prevPendingCountRef.current) {
        playSound("newOrder");
      }
      prevPendingCountRef.current = pendingCount;
    }
  }, [pendingCount, activeOrders, playSound]);

  const toggleOpen = useMutation(api.restaurants.toggleRestaurantOpen);

  async function handleToggle() {
    if (!restaurant || !user) return;
    await toggleOpen({ restaurantId: restaurant._id, ownerId: user.id });
  }

  if (!user) return null;

  // Not registered yet
  if (restaurant === null) {
    return <RegisterRestaurant ownerId={user.id} />;
  }

  // Loading
  if (restaurant === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // Pending approval
  if (restaurant.approvalStatus === "pending") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="text-5xl">⏳</div>
        <h2 className="text-xl font-bold">Cadastro em análise</h2>
        <p style={{ color: "var(--color-text-muted)" }}>
          Seu restaurante <strong>{restaurant.name}</strong> está aguardando aprovação.
          Você será notificado quando for aprovado.
        </p>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header className="px-4 py-4 sticky top-0 z-40" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base gradient-text">{restaurant.name}</h1>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {activeOrders?.length ?? 0} pedido{activeOrders?.length !== 1 ? "s" : ""} ativo{activeOrders?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isAudioUnlocked && (
              <button
                onClick={unlockAudio}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: "rgba(234,179,8,0.15)", color: "#eab308", border: "1px solid rgba(234,179,8,0.4)" }}
                title="Ativar notificações sonoras"
              >
                🔊 Som
              </button>
            )}
            {/* BIG toggle button */}
            <button
              onClick={handleToggle}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300"
              style={
                restaurant.isOpen
                  ? { background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "2px solid rgba(34,197,94,0.4)" }
                  : { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "2px solid rgba(239,68,68,0.4)" }
              }
            >
              <Power size={16} />
              {restaurant.isOpen ? "ABERTO" : "FECHADO"}
            </button>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="px-4 py-2 border-b" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div className="max-w-2xl mx-auto flex gap-1">
          {([
            { key: "orders", label: "Pedidos", icon: LayoutDashboard, badge: pendingCount },
            { key: "menu", label: "Cardápio", icon: UtensilsCrossed },
            { key: "settings", label: "Configurações", icon: Settings },
          ] as any[]).map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative"
              style={
                activeTab === key
                  ? { background: "var(--color-orange-glow)", color: "var(--color-orange)" }
                  : { color: "var(--color-text-muted)" }
              }
            >
              <Icon size={15} />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: "var(--color-orange)", color: "white" }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {activeTab === "orders" && (
          <OrdersTab restaurantId={restaurant._id} activeOrders={activeOrders} />
        )}
        {activeTab === "menu" && (
          <MenuManager restaurantId={restaurant._id} />
        )}
        {activeTab === "settings" && (
          <SettingsPanel restaurant={restaurant} ownerId={user.id} />
        )}
      </main>
    </div>
  );
}

function OrdersTab({
  restaurantId,
  activeOrders,
}: {
  restaurantId: Id<"restaurants">;
  activeOrders: any[] | undefined;
}) {
  const columns = [
    { status: "pending", label: "Novos", color: "#eab308" },
    { status: "preparing", label: "Preparando", color: "#3b82f6" },
    { status: "out_for_delivery", label: "Em entrega", color: "var(--color-orange)" },
  ];

  if (!activeOrders) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => <div key={i} className="h-32 rounded-xl shimmer" />)}
      </div>
    );
  }

  if (activeOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-semibold text-lg mb-1">Nenhum pedido ativo</h3>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Os novos pedidos aparecerão aqui automaticamente
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {columns.map((col) => {
        const orders = activeOrders.filter((o: any) => o.status === col.status);
        if (orders.length === 0) return null;
        return (
          <div key={col.status}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <h2 className="font-semibold text-sm">
                {col.label}
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: `${col.color}22`, color: col.color }}>
                  {orders.length}
                </span>
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {orders.map((order: any) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
