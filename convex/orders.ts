import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const deliveryAddressValidator = v.object({
  street: v.string(),
  number: v.string(),
  complement: v.optional(v.string()),
  neighborhood: v.string(),
  city: v.string(),
  reference: v.optional(v.string()),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
});

const orderItemValidator = v.object({
  menuItemId: v.id("menuItems"),
  name: v.string(),
  variationName: v.optional(v.string()),
  quantity: v.number(),
  price: v.number(),
  notes: v.optional(v.string()),
});

// Get orders for a restaurant (real-time)
export const getRestaurantOrders = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_restaurant_status", (q) =>
          q.eq("restaurantId", args.restaurantId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .collect();
  },
});

// Get active orders for dashboard (real-time)
export const getActiveOrders = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .collect();

    return allOrders.filter((o) =>
      ["pending", "preparing", "out_for_delivery"].includes(o.status)
    );
  },
});

// Get a single order by ID (for customer tracking)
export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Create a new order
export const createOrder = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryAddress: deliveryAddressValidator,
    items: v.array(orderItemValidator),
    totalAmount: v.number(),
    deliveryFee: v.number(),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    const newOrderNumber = (restaurant.currentOrderNumber || 0) + 1;
    await ctx.db.patch(args.restaurantId, { currentOrderNumber: newOrderNumber });

    return await ctx.db.insert("orders", {
      ...args,
      orderNumber: newOrderNumber,
      status: "pending",
      paymentStatus: "pending",
      createdAt: Date.now(),
    });
  },
});

// Update order status (by restaurant owner)
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});

// Update payment status (called by Mercado Pago webhook)
export const updatePaymentStatus = mutation({
  args: {
    orderId: v.id("orders"),
    paymentStatus: v.string(),
    mercadoPagoPaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orderId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(orderId, filteredUpdates);

    // If payment is confirmed, also update order status
    if (args.paymentStatus === "paid") {
      await ctx.db.patch(orderId, { status: "pending" }); // Awaiting restaurant confirmation
    }
  },
});

// Set Mercado Pago preference ID on order
export const setPreferenceId = mutation({
  args: {
    orderId: v.id("orders"),
    preferenceId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      mercadoPagoPreferenceId: args.preferenceId,
    });
  },
});
