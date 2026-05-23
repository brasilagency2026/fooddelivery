"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle, Clock, ChefHat, Bike, XCircle, Home } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Aguardando confirmação",
    description: "O restaurante está revisando seu pedido",
    icon: Clock,
    color: "#eab308",
  },
  {
    key: "preparing",
    label: "Preparando",
    description: "Seu pedido está sendo preparado com carinho",
    icon: ChefHat,
    color: "#3b82f6",
  },
  {
    key: "out_for_delivery",
    label: "Saiu para entrega",
    description: "Seu pedido está a caminho!",
    icon: Bike,
    color: "var(--color-orange)",
  },
  {
    key: "delivered",
    label: "Entregue!",
    description: "Bom apetite! 🎉",
    icon: CheckCircle,
    color: "#22c55e",
  },
];

export default function AcompanhamentoPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const order = useQuery(api.orders.getOrder, {
    orderId: params.id as Id<"orders">,
  });

  const restaurant = useQuery(
    api.restaurants.getRestaurant,
    order ? { restaurantId: order.restaurantId } : "skip"
  );

  if (!order) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const isCanceled = order.status === "canceled";
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "delivered";

  return (
    <div className="min-h-dvh pb-10" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header className="px-4 py-5 text-center" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="text-3xl mb-2">
          {isCanceled ? "❌" : isDelivered ? "🎉" : "🛵"}
        </div>
        <h1 className="font-bold text-xl mb-1">
          {isCanceled ? "Pedido cancelado" : isDelivered ? "Pedido entregue!" : "Acompanhe seu pedido"}
        </h1>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Atualização em tempo real · Pedido #{params.id.slice(-6).toUpperCase()}
        </p>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6 flex flex-col gap-5">
        {/* Payment alert */}
        {paymentStatus === "failure" && (
          <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            ⚠️ Houve um problema com o pagamento. O pedido será cancelado em breve.
          </div>
        )}
        {paymentStatus === "pending" && (
          <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", color: "#eab308" }}>
            ⏳ Pagamento pendente. Aguardando confirmação do Mercado Pago.
          </div>
        )}

        {/* Status timeline */}
        {!isCanceled && (
          <section className="glass-card p-5">
            <div className="flex flex-col gap-0">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex || isDelivered;
                const isCurrent = index === currentStepIndex && !isDelivered;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Icon column */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                        style={{
                          background: isCompleted || isCurrent
                            ? `${step.color}22`
                            : "var(--color-surface-2)",
                          border: `2px solid ${isCompleted || isCurrent ? step.color : "var(--color-border)"}`,
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color: isCompleted || isCurrent ? step.color : "var(--color-text-muted)",
                          }}
                          className={isCurrent ? "animate-pulse" : ""}
                        />
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className="w-0.5 h-8 my-1 transition-all duration-500"
                          style={{ background: isCompleted ? step.color : "var(--color-border)" }}
                        />
                      )}
                    </div>

                    {/* Text column */}
                    <div className="pb-8 pt-1.5">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: isCompleted || isCurrent ? "var(--color-text)" : "var(--color-text-muted)" }}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {isCanceled && (
          <section className="glass-card p-5 text-center">
            <XCircle size={40} className="mx-auto mb-3" style={{ color: "#ef4444" }} />
            <p className="font-semibold">Seu pedido foi cancelado</p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Entre em contato com o restaurante para mais informações
            </p>
          </section>
        )}

        {/* Delivery address */}
        <section className="glass-card p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
            ENTREGA PARA
          </h3>
          <p className="font-semibold">{order.customerName}</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {order.deliveryAddress.street}, {order.deliveryAddress.number}
            {order.deliveryAddress.complement && ` – ${order.deliveryAddress.complement}`}
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}
          </p>
          {order.deliveryAddress.reference && (
            <p className="text-xs mt-1" style={{ color: "var(--color-orange)" }}>
              📍 {order.deliveryAddress.reference}
            </p>
          )}
        </section>

        {/* Order items */}
        <section className="glass-card p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
            ITENS DO PEDIDO
          </h3>
          <div className="flex flex-col gap-2">
            {order.items.map((item: any, i: number) => (
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
          </div>
          <div className="border-t mt-3 pt-3" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text-muted)" }}>Taxa de entrega</span>
              <span>R$ {order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span style={{ color: "var(--color-orange)" }}>
                R$ {(order.totalAmount + order.deliveryFee).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Restaurant contact */}
        {restaurant && (
          <section className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>Restaurante</p>
              <p className="font-semibold">{restaurant.name}</p>
            </div>
            {restaurant.phone && (
              <a
                href={`https://wa.me/55${restaurant.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-2 rounded-xl font-medium"
                style={{ background: "#25D366", color: "white" }}
              >
                WhatsApp
              </a>
            )}
          </section>
        )}

        {/* Back home */}
        <Link href="/" className="flex items-center justify-center gap-2 text-sm py-3" style={{ color: "var(--color-text-muted)" }}>
          <Home size={14} />
          Voltar ao início
        </Link>
      </main>
    </div>
  );
}
