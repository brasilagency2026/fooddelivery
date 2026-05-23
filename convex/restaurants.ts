import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Haversine formula to calculate distance between two coordinates
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get nearby open restaurants based on user coordinates
export const getNearbyRestaurants = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const restaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_status", (q) =>
        q.eq("approvalStatus", "approved").eq("isOpen", true)
      )
      .collect();

    return restaurants
      .map((restaurant) => {
        const distance = haversineDistance(
          args.latitude,
          args.longitude,
          restaurant.latitude,
          restaurant.longitude
        );
        return { ...restaurant, distance };
      })
      .filter((r) => r.distance <= r.deliveryRadiusKm)
      .sort((a, b) => a.distance - b.distance);
  },
});

// Get all restaurants (for admin/listing)
export const getAllRestaurants = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("restaurants").collect();
  },
});

// Get restaurant by ID
export const getRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.restaurantId);
  },
});

// Get restaurant owned by current user
export const getMyRestaurant = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .first();
  },
});

// Create a new restaurant
export const createRestaurant = mutation({
  args: {
    ownerId: v.string(),
    name: v.string(),
    description: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    deliveryRadiusKm: v.number(),
    deliveryFee: v.number(),
    estimatedTimeMinutes: v.number(),
    cuisine: v.optional(v.string()),
    phone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("restaurants", {
      ...args,
      isOpen: false,
      approvalStatus: "approved", // Changed to approved for testing
    });
  },
});

// Toggle restaurant open/closed
export const toggleRestaurantOpen = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant || restaurant.ownerId !== args.ownerId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.restaurantId, { isOpen: !restaurant.isOpen });
  },
});

// Update restaurant settings
export const updateRestaurantSettings = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    ownerId: v.string(),
    deliveryRadiusKm: v.optional(v.number()),
    deliveryFee: v.optional(v.number()),
    estimatedTimeMinutes: v.optional(v.number()),
    mercadoPagoAccessToken: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant || restaurant.ownerId !== args.ownerId) {
      throw new Error("Unauthorized");
    }
    const { restaurantId, ownerId, storageId, ...updates } = args;
    
    let finalUpdates: any = { ...updates };
    
    if (storageId) {
      const url = await ctx.storage.getUrl(storageId);
      if (url) finalUpdates.imageUrl = url;
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(finalUpdates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(args.restaurantId, filteredUpdates);
  },
});
