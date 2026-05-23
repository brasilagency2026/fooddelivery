import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Create a Mercado Pago payment preference
// The payment goes directly to the restaurant's MP account
export const createPaymentPreference = action({
  args: {
    orderId: v.id("orders"),
    restaurantId: v.id("restaurants"),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    deliveryFee: v.number(),
    totalAmount: v.number(),
    customerName: v.string(),
    customerPhone: v.string(),
    backUrls: v.object({
      success: v.string(),
      failure: v.string(),
      pending: v.string(),
    }),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get the restaurant's MP access token
    const restaurant = await ctx.runQuery(api.restaurants.getRestaurant, {
      restaurantId: args.restaurantId,
    });

    if (!restaurant) throw new Error("Restaurante não encontrado");
    if (!restaurant.mercadoPagoAccessToken) {
      throw new Error("Restaurante não configurou pagamento");
    }

    const accessToken = restaurant.mercadoPagoAccessToken;

    // Build the preference payload
    const preferenceItems = args.items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: "BRL",
    }));

    // Add delivery fee as a line item if applicable
    if (args.deliveryFee > 0) {
      preferenceItems.push({
        title: "Taxa de Entrega",
        quantity: 1,
        unit_price: args.deliveryFee,
        currency_id: "BRL",
      });
    }

    const preferencePayload = {
      items: preferenceItems,
      payer: {
        name: args.customerName,
        phone: { area_code: "", number: args.customerPhone },
      },
      back_urls: args.backUrls,
      auto_return: "approved",
      external_reference: args.orderId,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      statement_descriptor: restaurant.name,
      metadata: {
        order_id: args.orderId,
        restaurant_id: args.restaurantId,
      },
    };

    // Call Mercado Pago API
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferencePayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Mercado Pago error: ${error.message || "Unknown error"}`
      );
    }

    const preference = await response.json();

    // Save preference ID to the order
    await ctx.runMutation(api.orders.setPreferenceId, {
      orderId: args.orderId,
      preferenceId: preference.id,
    });

    return {
      preferenceId: preference.id,
      initPoint: preference.init_point, // Production URL
      sandboxInitPoint: preference.sandbox_init_point, // Sandbox URL
    };
  },
});

// Verify a payment (called from webhook handler)
export const verifyPayment = action({
  args: {
    paymentId: v.string(),
    orderId: v.id("orders"),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args): Promise<any> => {
    const restaurant = await ctx.runQuery(api.restaurants.getRestaurant, {
      restaurantId: args.restaurantId,
    });

    if (!restaurant?.mercadoPagoAccessToken) {
      throw new Error("Access token not found");
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${args.paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${restaurant.mercadoPagoAccessToken}`,
        },
      }
    );

    const payment = await response.json();

    const statusMap: Record<string, string> = {
      approved: "paid",
      rejected: "failed",
      pending: "pending",
      in_process: "pending",
    };

    const paymentStatus = statusMap[payment.status] || "pending";

    await ctx.runMutation(api.orders.updatePaymentStatus, {
      orderId: args.orderId,
      paymentStatus,
      mercadoPagoPaymentId: args.paymentId,
    });

    return { status: paymentStatus };
  },
});
