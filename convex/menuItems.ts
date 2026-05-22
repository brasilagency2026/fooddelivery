import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all menu items for a restaurant
export const getMenuItems = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect();
  },
});

// Get ALL menu items for a restaurant (including unavailable, for admin)
export const getAllMenuItems = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
  },
});

// Add a menu item
export const addMenuItem = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      ...args,
      isAvailable: true,
    });
  },
});

// Update a menu item
export const updateMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { menuItemId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(menuItemId, filteredUpdates);
  },
});

// Delete a menu item
export const deleteMenuItem = mutation({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.menuItemId);
  },
});
