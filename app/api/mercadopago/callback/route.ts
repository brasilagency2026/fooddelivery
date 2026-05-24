import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // this is the restaurantId

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://delivery.foodpronto.com.br";
  
  if (!code || !state) {
    return NextResponse.redirect(new URL("/admin/dashboard?mp_error=missing_params", baseUrl));
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID || process.env.MP_CLIENT_ID;
    const clientSecret = process.env.MP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Mercado Pago Credentials missing in env variables.");
      return NextResponse.redirect(new URL("/admin/dashboard?mp_error=server_misconfig", baseUrl));
    }

    const redirectUri = `${baseUrl}/api/mercadopago/callback`;

    const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        client_secret: clientSecret,
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok || !data.access_token) {
      console.error("MP Auth Error:", data);
      return NextResponse.redirect(new URL("/admin/dashboard?mp_error=auth_failed", baseUrl));
    }

    // Save token in Convex
    // Use CONVEX_URL on server side, fallback to NEXT_PUBLIC_CONVEX_URL
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "CONVEX_URL missing" }, { status: 500 });
  }

  const convex = new ConvexHttpClient(convexUrl);
    await convex.mutation(api.restaurants.saveMercadoPagoToken, {
      restaurantId: state as Id<"restaurants">,
      accessToken: data.access_token,
    });

    // Redirect back to dashboard with success
    return NextResponse.redirect(new URL("/admin/dashboard?mp_success=1", baseUrl));
  } catch (error) {
    console.error("Error exchanging MP token:", error);
    return NextResponse.redirect(new URL("/admin/dashboard?mp_error=internal_error", baseUrl));
  }
}
