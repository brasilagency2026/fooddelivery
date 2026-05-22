import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mercado Pago sends different notification types
    const { type, data } = body;

    if (type === "payment") {
      const paymentId = data.id;

      // Fetch payment details from Mercado Pago
      // We need to find the order this payment belongs to
      // The external_reference field in the preference contains the orderId
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            // Use a platform-level token for webhook verification
            // In production, you'd verify by looking up the restaurant's token
            Authorization: `Bearer ${process.env.MERCADO_PAGO_PLATFORM_TOKEN || ""}`,
          },
        }
      );

      if (!mpResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch payment" }, { status: 400 });
      }

      const payment = await mpResponse.json();
      const orderId = payment.external_reference as Id<"orders">;

      if (!orderId) {
        return NextResponse.json({ error: "No order reference" }, { status: 400 });
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
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
