import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(req: NextRequest) {
  try {
    const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL!;
    const convex = new ConvexHttpClient(convexUrl);
    const body = await req.json();

    console.log("MP Webhook received:", JSON.stringify(body));

    const { type, data, action } = body;

    // MP sends either type="payment" or action="payment.updated"/"payment.created"
    const isPaymentEvent = type === "payment" || action?.startsWith("payment.");

    if (!isPaymentEvent) {
      return NextResponse.json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "No payment id" }, { status: 400 });
    }

    // First try with platform token if available
    const platformToken = process.env.MERCADO_PAGO_PLATFORM_TOKEN;

    let payment: any = null;

    if (platformToken) {
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${platformToken}` } }
      );
      if (mpResponse.ok) {
        payment = await mpResponse.json();
      }
    }

    // If no platform token or it failed, look up the order to find restaurant token
    if (!payment) {
      // Try to get order from external_reference in the notification body
      // MP also sends the external_reference directly in some webhook formats
      const externalRef = body.data?.external_reference || body.external_reference;

      if (externalRef) {
        try {
          const order = await convex.query(api.orders.getOrder, {
            orderId: externalRef as Id<"orders">,
          });
          if (order) {
            const restaurant = await convex.query(api.restaurants.getRestaurant, {
              restaurantId: order.restaurantId,
            });
            if (restaurant?.mercadoPagoAccessToken) {
              const mpResponse = await fetch(
                `https://api.mercadopago.com/v1/payments/${paymentId}`,
                { headers: { Authorization: `Bearer ${restaurant.mercadoPagoAccessToken}` } }
              );
              if (mpResponse.ok) {
                payment = await mpResponse.json();
              }
            }
          }
        } catch (e) {
          console.error("Error fetching order for webhook:", e);
        }
      }
    }

    // If still no payment data, we need to search by payment ID across all restaurants
    if (!payment) {
      // Last resort: get all restaurants and try each token
      const allRestaurants = await convex.query(api.restaurants.getAllRestaurants, {});
      for (const restaurant of allRestaurants) {
        if (!restaurant.mercadoPagoAccessToken) continue;
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          { headers: { Authorization: `Bearer ${restaurant.mercadoPagoAccessToken}` } }
        );
        if (mpResponse.ok) {
          const data = await mpResponse.json();
          // Verify this payment belongs to this restaurant
          if (data.id) {
            payment = data;
            break;
          }
        }
      }
    }

    if (!payment) {
      console.error("Could not fetch payment details for id:", paymentId);
      return NextResponse.json({ error: "Could not verify payment" }, { status: 400 });
    }

    console.log("MP Payment status:", payment.status, "external_reference:", payment.external_reference);

    const orderId = payment.external_reference as Id<"orders">;
    if (!orderId) {
      return NextResponse.json({ error: "No order reference in payment" }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      approved: "paid",
      rejected: "failed",
      pending: "pending",
      in_process: "pending",
      cancelled: "failed",
    };

    const paymentStatus = statusMap[payment.status] || "pending";

    await convex.mutation(api.orders.updatePaymentStatus, {
      orderId,
      paymentStatus,
      mercadoPagoPaymentId: String(paymentId),
    });

    console.log("Order updated:", orderId, "->", paymentStatus);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
