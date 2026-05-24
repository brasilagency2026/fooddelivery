"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MapPin, Phone, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando",
  preparing: "Preparando",
  out_for_delivery: "Em entrega",
  delivered: "Entregue",
  canceled: "Cancelado",
};

const NEXT_STATUS: Record<string, { status: string; label: string; color: string }> = {
  pending: { status: "preparing", label: "Aceitar e Preparar", color: "var(--color-orange)" },
  preparing: { status: "out_for_delivery", label: "Saiu para Entrega", color: "#3b82f6" },
  out_for_delivery: { status: "delivered", label: "Marcar como Entregue", color: "#22c55e" },
};

interface Order {
  _id: string;
  orderNumber?: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    reference?: string;
  };
  items: Array<{ name: string; quantity: number; price: number; notes?: string; variationName?: string }>;
  totalAmount: number;
  deliveryFee: number;
  status: string;
  paymentStatus: string;
  createdAt: number;
}

export function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(order.status === "pending");
  const [loading, setLoading] = useState(false);

  const updateStatus = useMutation(api.orders.updateOrderStatus);

  const nextAction = NEXT_STATUS[order.status];
  const timeAgo = formatTimeAgo(order.createdAt);
  
  const displayOrderNumber = order.orderNumber ? `#${String(order.orderNumber).padStart(4, "0")}` : "";

  async function handleStatusChange() {
    if (!nextAction) return;
    setLoading(true);
    try {
      await updateStatus({ orderId: order._id as Id<"orders">, status: nextAction.status });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await updateStatus({ orderId: order._id as Id<"orders">, status: "canceled" });
    } finally {
      setLoading(false);
    }
  }

  function handleDispatchWhatsApp() {
    const address = `${order.deliveryAddress.street}, ${order.deliveryAddress.number}${order.deliveryAddress.complement ? ` - ${order.deliveryAddress.complement}` : ""}, ${order.deliveryAddress.neighborhood}, ${order.deliveryAddress.city}`;
    
    const encodedAddress = encodeURIComponent(address);
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const wazeLink = `https://waze.com/ul?q=${encodedAddress}`;
    
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const courierLink = `${baseUrl}/courier/deliver/${order._id}`;
    
    const text = `*NOVA ENTREGA* 🛵\n\n*Pedido:* ${displayOrderNumber}\n*Cliente:* ${order.customerName}\n*Telefone:* ${order.customerPhone}\n\n*Endereço:*\n${address}\n${order.deliveryAddress.reference ? `*Ref:* ${order.deliveryAddress.reference}\n` : ""}\n📍 *Navegar:*\nGoogle Maps: ${mapsLink}\nWaze: ${wazeLink}\n\n✅ *Após entregar, clique no link abaixo para baixar no sistema:*\n${courierLink}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <div
      className="glass-card overflow-hidden animate-slide-up"
      style={order.status === "pending" ? { borderColor: "#eab308", boxShadow: "0 0 20px rgba(234,179,8,0.1)" } : {}}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold">
                {displayOrderNumber && <span style={{ color: "var(--color-orange)" }} className="mr-1">{displayOrderNumber}</span>}
                {order.customerName}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full status-${order.status}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {timeAgo}
              </span>
              <a
                href={`https://wa.me/${order.customerPhone.replace(/\D/g, "").startsWith("55") ? order.customerPhone.replace(/\D/g, "") : "55" + order.customerPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ color: "#25D366", fontWeight: 600 }}
                title="Conversar no WhatsApp"
              >
                <Phone size={11} />
                {order.customerPhone}
              </a>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} style={{ color: "var(--color-text-muted)" }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Address always visible */}
        <div className="flex items-start gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <MapPin size={12} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-orange)" }} />
          <span>
            {order.deliveryAddress.street}, {order.deliveryAddress.number}
            {order.deliveryAddress.complement && ` – ${order.deliveryAddress.complement}`},{" "}
            {order.deliveryAddress.neighborhood}
            {order.deliveryAddress.reference && ` (${order.deliveryAddress.reference})`}
          </span>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <div className="pt-3 flex flex-col gap-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm mb-1">
                <span className="flex-1 pr-2" style={{ color: "var(--color-text-muted)" }}>
                  <span className="font-medium mr-1">{item.quantity}x</span> {item.name}
                  {item.variationName && (
                    <span className="block text-[11px] mt-0.5 font-medium" style={{ color: "var(--color-orange)" }}>
                      Tamanho: {item.variationName}
                    </span>
                  )}
                  {item.notes && <span className="block text-xs mt-0.5 italic">({item.notes})</span>}
                </span>
                <span className="whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-bold text-sm" style={{ borderColor: "var(--color-border)" }}>
              <span>Total c/ entrega</span>
              <span style={{ color: "var(--color-orange)" }}>
                R$ {(order.totalAmount + order.deliveryFee).toFixed(2)}
              </span>
            </div>
            <div className="text-xs mt-1" style={{ color: order.paymentStatus === "paid" ? "#22c55e" : "#eab308" }}>
              Pagamento: {order.paymentStatus === "paid" ? "✓ Confirmado" : "⏳ Pendente"}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {nextAction && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {order.status === "out_for_delivery" && (
            <button
              onClick={handleDispatchWhatsApp}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{ background: "#25D366", color: "white" }}
            >
              <Phone size={16} /> Enviar p/ Entregador (WhatsApp)
            </button>
          )}
          <div className="flex gap-2 w-full">
            <button
              onClick={handleStatusChange}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: nextAction.color, color: "white" }}
            >
              {loading ? "..." : nextAction.label}
            </button>
            {order.status === "pending" && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                Recusar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h atrás`;
}
