"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Clock, ChefHat, Bike, CheckCircle, XCircle, ChevronRight, PackageSearch } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Aguardando", color: "#eab308", icon: Clock },
  preparing: { label: "Preparando", color: "#3b82f6", icon: ChefHat },
  out_for_delivery: { label: "Saiu para entrega", color: "var(--color-orange)", icon: Bike },
  delivered: { label: "Entregue", color: "#22c55e", icon: CheckCircle },
  canceled: { label: "Cancelado", color: "#ef4444", icon: XCircle },
};

export default function MeusPedidosPage() {
  const router = useRouter();
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("myOrders") || "[]");
    setOrderIds(savedOrders);
    setLoaded(true);
  }, []);

  const orders = useQuery(
    api.orders.getOrdersByIds,
    orderIds.length > 0 ? { orderIds } : "skip"
  );

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push("/")} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface)" }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-bold text-lg">Meus Pedidos</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6">
        {!loaded ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
          </div>
        ) : orderIds.length === 0 ? (
          <div className="text-center py-16">
            <PackageSearch size={48} className="mx-auto mb-4 opacity-50" style={{ color: "var(--color-text-muted)" }} />
            <h3 className="text-lg font-semibold mb-2">Nenhum pedido recente</h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Você ainda não fez nenhum pedido neste dispositivo, ou seu histórico foi apagado.
            </p>
            <button 
              onClick={() => router.push("/")}
              className="mt-6 btn-orange px-6 py-2"
            >
              Ver Restaurantes
            </button>
          </div>
        ) : orders === undefined ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Não foi possível encontrar os pedidos salvos no banco de dados.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-10">
            {orders.map((order: any) => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const StatusIcon = statusInfo.icon;
              const displayOrderNumber = order.orderNumber ? `#${String(order.orderNumber).padStart(4, "0")}` : `#${order._id.slice(-6).toUpperCase()}`;
              
              const total = order.totalAmount + order.deliveryFee;
              const date = new Date(order.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <Link href={`/acompanhamento/${order._id}`} key={order._id}>
                  <div className="glass-card p-4 transition-transform hover:scale-[1.01] active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold">{order.restaurantName}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          Pedido {displayOrderNumber} • {date}
                        </p>
                      </div>
                      <ChevronRight size={18} style={{ color: "var(--color-text-muted)" }} />
                    </div>
                    
                    <div className="border-t border-b py-3 my-3 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                      <div className="flex items-center gap-2">
                        <StatusIcon size={16} style={{ color: statusInfo.color }} />
                        <span className="font-medium text-sm" style={{ color: statusInfo.color }}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <span className="font-bold text-sm">R$ {total.toFixed(2)}</span>
                    </div>

                    <div className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                      {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
