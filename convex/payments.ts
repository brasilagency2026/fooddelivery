import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get the restaurant's MP public key (needed for Payment Brick)
export const getMpPublicKey = action({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args): Promise<string> => {
    const restaurant = await ctx.runQuery(api.restaurants.getRestaurant, {
      restaurantId: args.restaurantId,
    });
    if (!restaurant?.mercadoPagoAccessToken) {
      throw new Error("Restaurante não configurou pagamento");
    }
    // Return stored public key if available
    if ((restaurant as any).mercadoPagoPublicKey) {
      return (restaurant as any).mercadoPagoPublicKey as string;
    }
    // Fallback: fetch from MP API using the credentials endpoint
    const response = await fetch(
      `https://api.mercadopago.com/users/me`,
      { headers: { Authorization: `Bearer ${restaurant.mercadoPagoAccessToken}` } }
    );
    if (!response.ok) throw new Error("Erro ao obter credenciais MP");
    const data = await response.json();
    // The public key format for MP Brick is APP_USR-{user_id}
    // We need to get it from the credentials
    const credResponse = await fetch(
      `https://api.mercadopago.com/applications/serial/access_token`,
      { headers: { Authorization: `Bearer ${restaurant.mercadoPagoAccessToken}` } }
    );
    if (credResponse.ok) {
      const cred = await credResponse.json();
      if (cred.public_key) return cred.public_key;
    }
    throw new Error("Não foi possível obter a public_key. Reconecte o Mercado Pago no painel.");
  },
});

// Process a direct payment via Payment Brick token
export const processPayment = action({
  args: {
    orderId: v.id("orders"),
    restaurantId: v.id("restaurants"),
    token: v.string(),           // card token from Brick
    paymentMethodId: v.string(), // e.g. "visa", "pix"
    installments: v.number(),
    totalAmount: v.number(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    pixMethod: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    const restaurant = await ctx.runQuery(api.restaurants.getRestaurant, {
      restaurantId: args.restaurantId,
    });
    if (!restaurant?.mercadoPagoAccessToken) {
      throw new Error("Restaurante não configurou pagamento");
    }

    const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`;

    const paymentBody: any = {
      transaction_amount: args.totalAmount,
      description: `Pedido - ${restaurant.name}`,
      payment_method_id: args.paymentMethodId,
      notification_url: notificationUrl,
      external_reference: args.orderId,
      payer: {
        email: args.customerEmail,
        first_name: args.customerName.split(" ")[0],
        last_name: args.customerName.split(" ").slice(1).join(" ") || args.customerName.split(" ")[0],
        phone: { area_code: args.customerPhone.slice(0, 2), number: args.customerPhone.slice(2) },
      },
      metadata: { order_id: args.orderId, restaurant_id: args.restaurantId },
    };

    if (args.pixMethod) {
      // PIX — no token needed
      paymentBody.payment_method_id = "pix";
    } else {
      // Card payment
      paymentBody.token = args.token;
      paymentBody.installments = args.installments;
    }

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${restaurant.mercadoPagoAccessToken}`,
        "X-Idempotency-Key": args.orderId,
      },
      body: JSON.stringify(paymentBody),
    });

    const payment = await response.json();

    if (!response.ok) {
      throw new Error(payment.message || "Erro ao processar pagamento");
    }

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
      mercadoPagoPaymentId: String(payment.id),
    });

    return {
      status: payment.status,
      paymentStatus,
      paymentId: payment.id,
      // For PIX: return QR code data
      pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
    };
  },
});

// Create a Mercado Pago payment preference (kept as fallback)
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
    const restaurant = await ctx.runQuery(api.restaurants.getRestaurant, {
      restaurantId: args.restaurantId,
    });

    if (!restaurant) throw new Error("Restaurante não encontrado");
    if (!restaurant.mercadoPagoAccessToken) {
      throw new Error("Restaurante não configurou pagamento");
    }

    const accessToken = restaurant.mercadoPagoAccessToken;

    const preferenceItems = args.items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: "BRL",
    }));

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
      binary_mode: false,
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }], // exclude boleto
        default_installments: 1,
      },
      metadata: {
        order_id: args.orderId,
        restaurant_id: args.restaurantId,
      },
    };

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
      throw new Error(`Mercado Pago error: ${error.message || "Unknown error"}`);
    }

    const preference = await response.json();

    await ctx.runMutation(api.orders.setPreferenceId, {
      orderId: args.orderId,
      preferenceId: preference.id,
    });

    return {
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
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
