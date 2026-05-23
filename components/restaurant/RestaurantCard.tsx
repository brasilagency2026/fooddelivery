import Link from "next/link";
import { Clock, MapPin, DollarSign, Star } from "lucide-react";

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  cuisine?: string;
  deliveryFee: number;
  estimatedTimeMinutes: number;
  distance?: number;
  isOpen: boolean;
  state?: string;
  citySlug?: string;
  restaurantSlug?: string;
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const state = restaurant.state?.toLowerCase() || "sp";
  const city = restaurant.citySlug || "cidade";
  const slug = restaurant.restaurantSlug || restaurant._id;

  return (
    <Link href={`/${state}/${city}/${slug}`}>
      <div
        className="glass-card overflow-hidden hover:border-orange-500/40 transition-all duration-300 cursor-pointer group"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🍽️
            </div>
          )}

          {/* Open/closed badge */}
          <div className="absolute top-3 left-3">
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full"
              style={
                restaurant.isOpen
                  ? { background: "rgba(34,197,94,0.2)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }
                  : { background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }
              }
            >
              {restaurant.isOpen ? "● Aberto" : "● Fechado"}
            </span>
          </div>

          {/* Cuisine badge */}
          {restaurant.cuisine && (
            <div className="absolute top-3 right-3">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(0,0,0,0.6)", color: "var(--color-text-muted)", backdropFilter: "blur(8px)" }}
              >
                {restaurant.cuisine}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-orange-500 transition-colors">
            {restaurant.name}
          </h3>
          <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
            {restaurant.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span className="flex items-center gap-1">
              <Clock size={12} style={{ color: "var(--color-orange)" }} />
              {restaurant.estimatedTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={12} style={{ color: "var(--color-orange)" }} />
              {restaurant.deliveryFee === 0
                ? "Frete grátis"
                : `R$ ${restaurant.deliveryFee.toFixed(2)} entrega`}
            </span>
            {restaurant.distance !== undefined && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {restaurant.distance < 1
                  ? `${Math.round(restaurant.distance * 1000)}m`
                  : `${restaurant.distance.toFixed(1)}km`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
