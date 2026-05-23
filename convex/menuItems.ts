import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
    storageId: v.optional(v.id("_storage")),
    category: v.optional(v.string()),
    variations: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    let finalImageUrl = args.imageUrl;
    
    // If a file was uploaded to Convex Storage, resolve its permanent URL
    if (args.storageId) {
      const url = await ctx.storage.getUrl(args.storageId);
      if (url) finalImageUrl = url;
    }

    return await ctx.db.insert("menuItems", {
      restaurantId: args.restaurantId,
      name: args.name,
      description: args.description,
      price: args.price,
      imageUrl: finalImageUrl,
      category: args.category,
      variations: args.variations,
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
    storageId: v.optional(v.id("_storage")),
    isAvailable: v.optional(v.boolean()),
    category: v.optional(v.string()),
    variations: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { menuItemId, storageId, ...updates } = args;
    
    let finalUpdates: any = { ...updates };
    
    if (storageId) {
      const url = await ctx.storage.getUrl(storageId);
      if (url) finalUpdates.imageUrl = url;
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(finalUpdates).filter(([, v]) => v !== undefined)
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
