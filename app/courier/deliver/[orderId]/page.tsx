"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MapPin, CheckCircle, Package, User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function CourierDeliveryPage({ params }: { params: { orderId: string } }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // We cast to Id<"orders"> assuming the URL has a valid ID
  const orderId = params.orderId as Id<"orders">;
  
  const order = useQuery(api.orders.getOrder, { orderId });
  const markAsDelivered = useMutation(api.orders.markAsDeliveredCourier);

  async function handleConfirmDelivery() {
    setLoading(true);
    try {
      await markAsDelivered({ orderId });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao confirmar entrega. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (order === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-4 text-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-xl font-bold mb-2">Pedido não encontrado</h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Este link é inválido ou o pedido foi excluído.</p>
      </div>
    );
  }

  const isDelivered = order.status === "delivered" || success;

  return (
    <div className="min-h-dvh p-4 flex flex-col items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛵</div>
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'DM Sans', sans-serif" }}>Delivery Pronto</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Portal do Entregador</p>
        </div>

        {isDelivered ? (
          <div className="glass-card p-8 text-center animate-slide-up" style={{ border: "1px solid #22c55e", boxShadow: "0 0 30px rgba(34, 197, 94, 0.1)" }}>
            <div className="flex justify-center mb-4 text-[#22c55e]">
              <CheckCircle size={64} />
            </div>
            <h2 className="text-xl font-bold mb-2">Entrega Confirmada!</h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              O cliente e o restaurante já foram notificados. Bom trabalho!
            </p>
          </div>
        ) : (
          <div className="glass-card p-6 animate-slide-up">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package size={18} style={{ color: "var(--color-orange)" }} /> 
              Pedido {order.orderNumber ? `#${String(order.orderNumber).padStart(4, "0")}` : ""}
            </h2>
            
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-start gap-3">
                <User size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-text-muted)" }} />
                <div>
                  <p className="text-sm font-semibold">{order.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-text-muted)" }} />
                <div>
                  <p className="text-sm leading-relaxed">
                    {order.deliveryAddress.street}, {order.deliveryAddress.number}
                    {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}<br/>
                    {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}
                  </p>
                  {order.deliveryAddress.reference && (
                    <p className="text-xs mt-1 italic" style={{ color: "var(--color-text-muted)" }}>
                      Ref: {order.deliveryAddress.reference}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Valor a cobrar na entrega:</p>
                <p className="text-lg font-bold" style={{ color: order.paymentStatus === "paid" ? "#22c55e" : "var(--color-orange)" }}>
                  {order.paymentStatus === "paid" ? "PAGO ONLINE" : `R$ ${(order.totalAmount + order.deliveryFee).toFixed(2)}`}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmDelivery}
              disabled={loading || order.status !== "out_for_delivery"}
              className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: "#22c55e", color: "white", boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)" }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" />
              ) : (
                <>
                  <CheckCircle size={20} /> Confirmar Entrega
                </>
              )}
            </button>
            
            {order.status !== "out_for_delivery" && order.status !== "delivered" && (
              <p className="text-xs text-center mt-3 text-red-400">
                Este pedido não está com status "Saiu para Entrega".
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
