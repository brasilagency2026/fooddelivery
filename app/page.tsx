"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { LocationPermission } from "@/components/ui/LocationPermission";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { MapPin, Search, Flame, ChevronDown } from "lucide-react";

interface Coords {
  latitude: number;
  longitude: number;
}

export default function HomePage() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const restaurants = useQuery(
    api.restaurants.getNearbyRestaurants,
    coords ? { latitude: coords.latitude, longitude: coords.longitude } : "skip"
  );

  useEffect(() => {
    // Try to get location automatically on mount
    if (navigator.geolocation) {
      requestLocation();
    }
  }, []);

  function requestLocation() {
    setLocationRequested(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationError(null);
      },
      (err) => {
        setLocationError(
          "Precisamos da sua localização para encontrar restaurantes próximos."
        );
        console.error(err);
      }
    );
  }

  const filteredRestaurants = restaurants?.filter((r: any) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <MapPin size={14} style={{ color: "var(--color-orange)" }} />
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {coords ? "Perto de você" : "Localização"}
                </span>
                <ChevronDown size={12} style={{ color: "var(--color-text-muted)" }} />
              </div>
              <h1 className="text-lg font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span className="gradient-text">Food Pronto</span>
                <span style={{ color: "var(--color-text)" }}> Delivery</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/como-funciona"
                className="text-xs px-3 py-1.5 rounded-lg font-medium border border-transparent hover:border-[var(--color-border)] transition"
                style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
              >
                Como Funciona
              </Link>
              <button
                onClick={() => window.location.href = "/admin/login"}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
              >
                Sou restaurante
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar restaurantes ou pratos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 text-sm rounded-xl outline-none transition-all"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-24">
        <div className="mt-6 mb-6 rounded-3xl p-4 text-center border border-[var(--color-border)]" style={{ background: "var(--color-surface)", boxShadow: "0 0 0 1px rgba(255,255,255,0.02)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-orange)" }}>
            Descubra como o Food Pronto Delivery deixa seu restaurante pronto para vender mais
          </p>
          <Link
            href="/como-funciona"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--color-orange)", color: "white" }}
          >
            Ver como funciona
          </Link>
        </div>

        {/* Location permission UI */}
        {locationError && (
          <div className="mt-6">
            <LocationPermission onRequest={requestLocation} />
          </div>
        )}

        {/* Restaurant list */}
        {coords && (
          <div className="mt-6">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <Flame size={18} style={{ color: "var(--color-orange)" }} />
              <span className="font-semibold">
                {filteredRestaurants
                  ? `${filteredRestaurants.length} restaurante${filteredRestaurants.length !== 1 ? "s" : ""} aberto${filteredRestaurants.length !== 1 ? "s" : ""}`
                  : "Carregando..."}
              </span>
            </div>

            {/* Loading state */}
            {restaurants === undefined && <LoadingGrid />}

            {/* Empty state */}
            {restaurants !== undefined && filteredRestaurants?.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold mb-2">Nenhum restaurante encontrado</h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {searchQuery
                    ? "Tente outro termo de busca"
                    : "Não há restaurantes com delivery na sua área ainda"}
                </p>
              </div>
            )}

            {/* Restaurant cards */}
            <div className="flex flex-col gap-4">
              {filteredRestaurants?.map((restaurant: any, i: number) => (
                <div
                  key={restaurant._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
                >
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Initial state - no location yet */}
        {!coords && !locationError && locationRequested && (
          <div className="mt-16 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse" style={{ background: "var(--color-orange-glow)" }}>
              <MapPin size={28} style={{ color: "var(--color-orange)" }} />
            </div>
            <p style={{ color: "var(--color-text-muted)" }}>Obtendo sua localização...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
          <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} Food Pronto Delivery
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-1">
            <a href="/quem-somos" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>Quem Somos</a>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <a href="/como-funciona" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>Como Funciona</a>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <a href="/trabalhe-conosco" className="hover:underline text-[var(--color-orange)] font-bold">Trabalhe Conosco</a>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <a href="/contato" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>Contato</a>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <a href="/admin/login" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>Área do Restaurante</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for My Orders */}
      <MeusPedidosButton />
    </div>
  );
}

function MeusPedidosButton() {
  const [hasOrders, setHasOrders] = useState(false);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("myOrders") || "[]");
    setHasOrders(orders.length > 0);
  }, []);

  if (!hasOrders) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
      <button
        onClick={() => window.location.href = "/meus-pedidos"}
        className="flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--color-orange)", color: "white" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span className="font-bold text-sm">Meus Pedidos</span>
      </button>
    </div>
  );
}
