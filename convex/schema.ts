import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  restaurants: defineTable({
    ownerId: v.string(),
    name: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    deliveryRadiusKm: v.number(),
    deliveryFee: v.number(),
    estimatedTimeMinutes: v.number(),
    isOpen: v.boolean(),
    approvalStatus: v.string(), // "pending" | "approved" | "rejected"
    mercadoPagoAccessToken: v.optional(v.string()),
    cuisine: v.optional(v.string()),
    phone: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["approvalStatus", "isOpen"]),

  menuItems: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    isAvailable: v.boolean(),
    category: v.optional(v.string()),
  }).index("by_restaurant", ["restaurantId"]),

  orders: defineTable({
    restaurantId: v.id("restaurants"),
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryAddress: v.object({
      street: v.string(),
      number: v.string(),
      complement: v.optional(v.string()),
      neighborhood: v.string(),
      city: v.string(),
      reference: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
    }),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    totalAmount: v.number(),
    deliveryFee: v.number(),
    status: v.string(), // "pending" | "preparing" | "out_for_delivery" | "delivered" | "canceled"
    paymentStatus: v.string(), // "pending" | "paid" | "failed"
    mercadoPagoPaymentId: v.optional(v.string()),
    mercadoPagoPreferenceId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_status", ["restaurantId", "status"])
    .index("by_payment", ["mercadoPagoPaymentId"]),
});
