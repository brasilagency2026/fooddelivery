"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Clock, MapPin, ShoppingCart, Plus, Minus, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variationName?: string;
  notes?: string;
}

export default function RestaurantePage({ params }: { params: { estado: string, cidade: string, slug: string } }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [variationModalItem, setVariationModalItem] = useState<any | null>(null);
  const [detailsModalItem, setDetailsModalItem] = useState<any | null>(null);

  const restaurant = useQuery(api.restaurants.getRestaurantBySlug, {
    state: params.estado,
    citySlug: params.cidade,
    restaurantSlug: params.slug,
  });

  const menuItems = useQuery(api.menuItems.getMenuItems, restaurant ? {
    restaurantId: restaurant._id,
  } : "skip");

  function addToCart(item: any, variationName?: string, priceOverride?: number) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id && c.variationName === variationName);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item._id && c.variationName === variationName ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { 
        menuItemId: item._id, 
        name: item.name, 
        price: priceOverride ?? item.price, 
        quantity: 1,
        variationName
      }];
    });
  }

  function removeFromCart(menuItemId: string, variationName?: string) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId && c.variationName === variationName);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.menuItemId === menuItemId && c.variationName === variationName ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => !(c.menuItemId === menuItemId && c.variationName === variationName));
    });
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!restaurant) return;
    sessionStorage.setItem("cart", JSON.stringify(cart));
    sessionStorage.setItem("restaurantId", restaurant._id);
    router.push("/checkout");
  };

  const categories = menuItems
    ? [...new Set(menuItems.map((i: any) => i.category || "Cardápio"))]
    : [];

  if (restaurant === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-xl font-bold mb-2">Restaurante não encontrado</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>O link pode estar quebrado ou o restaurante foi removido.</p>
        <Link href="/" className="btn-orange text-sm px-6 py-2">Voltar para o início</Link>
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

      {/* Category Navigation */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-30 px-4 py-3 overflow-x-auto whitespace-nowrap hide-scrollbar border-b" style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderColor: "var(--color-border)" }}>
          <div className="flex gap-3 max-w-xl mx-auto">
            {categories.map((category: any) => (
              <a
                key={category}
                href={`#cat-${category.replace(/\s+/g, '-').toLowerCase()}`}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[var(--color-surface)]"
                style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      )}

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

        {categories.map((category: any) => (
          <div key={category} id={`cat-${category.replace(/\s+/g, '-').toLowerCase()}`} className="mt-6 scroll-mt-20">
            <h2 className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
              {category}
            </h2>
            <div className="flex flex-col gap-3">
              {menuItems
                ?.filter((item: any) => (item.category || "Cardápio") === category)
                .map((item: any) => {
                  const cartItemsForItem = cart.filter((c) => c.menuItemId === item._id);
                  const totalQty = cartItemsForItem.reduce((sum, c) => sum + c.quantity, 0);
                  const hasVariations = item.variations && item.variations.length > 0;
                  
                  // Display price
                  let displayPrice = `R$ ${item.price.toFixed(2)}`;
                  if (hasVariations) {
                    const minPrice = Math.min(...item.variations.map((v: any) => v.price));
                    displayPrice = `A partir de R$ ${minPrice.toFixed(2)}`;
                  }

                  return (
                    <div
                      key={item._id}
                      onClick={() => setDetailsModalItem(item)}
                      className="glass-card p-4 flex gap-3 items-center cursor-pointer transition-transform active:scale-[0.98]"
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
                        <span className="font-bold text-xs" style={{ color: "var(--color-orange)" }}>
                          {displayPrice}
                        </span>
                      </div>

                      {/* Quantity control / Choose button */}
                      <div className="flex-shrink-0 flex items-center">
                        {hasVariations ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVariationModalItem(item);
                            }}
                            disabled={!restaurant.isOpen}
                            className="text-xs px-4 py-2 rounded-full font-semibold relative disabled:opacity-50"
                            style={{ background: "var(--color-orange)", color: "white" }}
                          >
                            Escolher
                            {totalQty > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">
                                {totalQty}
                              </span>
                            )}
                          </button>
                        ) : (
                          totalQty > 0 ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(item._id);
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold w-5 text-center text-sm">{totalQty}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                                disabled={!restaurant.isOpen}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: "var(--color-orange)" }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                              }}
                              disabled={!restaurant.isOpen}
                              className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
                              style={{ background: "var(--color-orange)" }}
                            >
                              <Plus size={14} />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </main>

      {/* Item Details Modal */}
      {detailsModalItem && !variationModalItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setDetailsModalItem(null)}>
          <div className="w-full max-w-xl sm:rounded-3xl rounded-t-3xl p-5 pb-8 sm:pb-5 animate-slide-up relative" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setDetailsModalItem(null)} className="absolute top-4 right-4 p-2 rounded-full z-10" style={{ background: "rgba(10,10,10,0.5)", color: "white", backdropFilter: "blur(4px)" }}>
              <X size={18} />
            </button>
            
            {detailsModalItem.imageUrl && (
              <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-5" style={{ background: "var(--color-surface-2)" }}>
                <img src={detailsModalItem.imageUrl} alt={detailsModalItem.name} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className={!detailsModalItem.imageUrl ? "mt-4" : ""}>
              <h3 className="font-bold text-2xl mb-2">{detailsModalItem.name}</h3>
              <p className="text-sm leading-relaxed mb-6 whitespace-pre-wrap" style={{ color: "var(--color-text-muted)" }}>
                {detailsModalItem.description}
              </p>
              
              <div className="flex items-center justify-between pt-5 border-t" style={{ borderColor: "var(--color-border)" }}>
                <span className="font-bold text-xl" style={{ color: "var(--color-orange)" }}>
                  {detailsModalItem.variations?.length > 0 
                    ? `A partir de R$ ${Math.min(...detailsModalItem.variations.map((v: any) => v.price)).toFixed(2)}`
                    : `R$ ${detailsModalItem.price.toFixed(2)}`
                  }
                </span>
                
                {detailsModalItem.variations?.length > 0 ? (
                  <button
                    onClick={() => {
                      setVariationModalItem(detailsModalItem);
                      setDetailsModalItem(null);
                    }}
                    disabled={!restaurant.isOpen}
                    className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
                    style={{ background: "var(--color-orange)", color: "white" }}
                  >
                    Escolher
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      addToCart(detailsModalItem);
                      setDetailsModalItem(null);
                    }}
                    disabled={!restaurant.isOpen}
                    className="px-6 py-3 rounded-full font-bold flex items-center gap-2 disabled:opacity-50"
                    style={{ background: "var(--color-orange)", color: "white" }}
                  >
                    <Plus size={18} /> Adicionar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variation Modal */}
      {variationModalItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-xl rounded-t-3xl p-5 pb-8 animate-slide-up" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", maxHeight: "85vh", overflowY: "auto" }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{variationModalItem.name}</h3>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Escolha uma variação</p>
              </div>
              <button onClick={() => setVariationModalItem(null)} className="p-2 rounded-full" style={{ background: "var(--color-surface-2)" }}>
                <X size={18} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              {variationModalItem.variations.map((v: any, idx: number) => {
                const qty = cart.find(c => c.menuItemId === variationModalItem._id && c.variationName === v.name)?.quantity || 0;
                
                return (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                    <div>
                      <p className="font-semibold text-sm">{v.name}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: "var(--color-orange)" }}>R$ {v.price.toFixed(2)}</p>
                    </div>
                    
                    {qty > 0 ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeFromCart(variationModalItem._id, v.name)}
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold w-4 text-center">{qty}</span>
                        <button
                          onClick={() => addToCart(variationModalItem, v.name, v.price)}
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ background: "var(--color-orange)", color: "white" }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(variationModalItem, v.name, v.price)}
                        className="px-4 py-2 rounded-full text-xs font-semibold"
                        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8">
              <button 
                onClick={() => setVariationModalItem(null)}
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                style={{ background: "var(--color-orange)", color: "white" }}
              >
                Concluir <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating cart button */}
      {cartCount > 0 && !variationModalItem && (
        <div className="fixed bottom-6 left-4 right-4 max-w-xl mx-auto z-40 animate-slide-up">
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
