"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Clock, MapPin, ShoppingCart, Plus, Minus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export default function RestaurantePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const restaurant = useQuery(api.restaurants.getRestaurant, {
    restaurantId: params.id as Id<"restaurants">,
  });

  const menuItems = useQuery(api.menuItems.getMenuItems, {
    restaurantId: params.id as Id<"restaurants">,
  });

  function addToCart(item: { _id: string; name: string; price: number }) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function removeFromCart(menuItemId: string) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.menuItemId !== menuItemId);
    });
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    // Store cart in sessionStorage before navigating
    sessionStorage.setItem("cart", JSON.stringify(cart));
    sessionStorage.setItem("restaurantId", params.id);
    router.push("/checkout");
  };

  // Group menu items by category
  const categories = menuItems
    ? [...new Set(menuItems.map((i) => i.category || "Cardápio"))]
    : [];

  if (!restaurant) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-32" style={{ background: "var(--color-bg)" }}>
      {/* Hero Image */}
      <div className="relative h-56" style={{ background: "var(--color-surface-2)" }}>
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.5), rgba(10,10,10,0.8))" }} />

        {/* Back button */}
        <Link href="/" className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(10,10,10,0.7)", backdropFilter: "blur(8px)" }}>
          <ArrowLeft size={18} />
        </Link>

        {/* Restaurant name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold mb-1">{restaurant.name}</h1>
          <p className="text-sm" style={{ color: "rgba(245,245,245,0.7)" }}>{restaurant.description}</p>
        </div>
      </div>

      {/* Restaurant info bar */}
      <div className="px-4 py-3 flex gap-4 text-xs border-b" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <span className="flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
          <Clock size={12} style={{ color: "var(--color-orange)" }} />
          {restaurant.estimatedTimeMinutes} min
        </span>
        <span className="flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
          Entrega: {restaurant.deliveryFee === 0 ? "Grátis" : `R$ ${restaurant.deliveryFee.toFixed(2)}`}
        </span>
        <span className="flex items-center gap-1" style={{ color: restaurant.isOpen ? "#22c55e" : "#ef4444" }}>
          ● {restaurant.isOpen ? "Aberto" : "Fechado"}
        </span>
      </div>

      {/* Menu */}
      <main className="max-w-xl mx-auto px-4">
        {!restaurant.isOpen && (
          <div className="mt-4 p-4 rounded-xl text-sm text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
            Este restaurante está fechado no momento
          </div>
        )}

        {menuItems === undefined && (
          <div className="mt-6 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl shimmer" />
            ))}
          </div>
        )}

        {categories.map((category) => (
          <div key={category} className="mt-6">
            <h2 className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
              {category}
            </h2>
            <div className="flex flex-col gap-3">
              {menuItems
                ?.filter((item) => (item.category || "Cardápio") === category)
                .map((item) => {
                  const cartItem = cart.find((c) => c.menuItemId === item._id);
                  return (
                    <div
                      key={item._id}
                      className="glass-card p-4 flex gap-3 items-center"
                    >
                      {/* Item image */}
                      {item.imageUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--color-surface-2)" }}>
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Item info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-0.5 text-sm">{item.name}</h3>
                        <p className="text-xs mb-2 line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
                          {item.description}
                        </p>
                        <span className="font-bold" style={{ color: "var(--color-orange)" }}>
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity control */}
                      <div className="flex-shrink-0">
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold w-5 text-center text-sm">{cartItem.quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              disabled={!restaurant.isOpen}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background: "var(--color-orange)" }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            disabled={!restaurant.isOpen}
                            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
                            style={{ background: "var(--color-orange)" }}
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </main>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-xl mx-auto z-50">
          <button
            onClick={handleCheckout}
            className="btn-orange w-full flex items-center justify-between"
          >
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "rgba(255,255,255,0.2)" }}>
              {cartCount}
            </span>
            <span className="font-semibold">Finalizar pedido</span>
            <span className="font-bold">R$ {(cartTotal + restaurant.deliveryFee).toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
