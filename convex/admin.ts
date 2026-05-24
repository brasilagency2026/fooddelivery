import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper to check admin secret
function checkAdminSecret(secret: string) {
  // We use a simple environment variable check for the admin secret
  // This secret should be set in Convex dashboard
  const validSecret = process.env.ADMIN_SECRET;
  if (!validSecret || secret !== validSecret) {
    throw new Error("Unauthorized: Invalid Admin Secret");
  }
}

export const getAllRestaurantsAdmin = query({
  args: {
    adminSecret: v.string(),
  },
  handler: async (ctx, args) => {
    checkAdminSecret(args.adminSecret);
    const restaurants = await ctx.db.query("restaurants").order("desc").collect();
    return restaurants;
  },
});

export const updateRestaurantAdmin = mutation({
  args: {
    adminSecret: v.string(),
    restaurantId: v.id("restaurants"),
    updates: v.object({
      approvalStatus: v.optional(v.string()),
      subscriptionStatus: v.optional(v.string()),
      subscriptionEndDate: v.optional(v.number()),
      isOpen: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    checkAdminSecret(args.adminSecret);
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    await ctx.db.patch(args.restaurantId, args.updates);
  },
});

export const deleteRestaurantAdmin = mutation({
  args: {
    adminSecret: v.string(),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    checkAdminSecret(args.adminSecret);
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    // Delete associated menu items
    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
    for (const item of menuItems) {
      await ctx.db.delete(item._id);
    }

    // Delete associated orders
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }

    // Finally delete the restaurant
    await ctx.db.delete(args.restaurantId);
  },
});
