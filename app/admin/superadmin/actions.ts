"use server";

import { revalidatePath } from "next/cache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth, clerkClient } from "@clerk/nextjs/server";

const SUPER_ADMIN_EMAIL = "glwebagency2@gmail.com";

async function checkSuperAdmin() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");
  
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;
  
  if (email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Unauthorized: Not Super Admin");
  }
}

function getConvexClient(url: string) {
  if (!url) {
    throw new Error("Server misconfiguration: CONVEX_URL is missing from client");
  }
  return new ConvexHttpClient(url);
}

function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("Server misconfiguration: ADMIN_SECRET missing");
  return secret;
}

export async function fetchAllRestaurantsAdmin(convexUrl: string) {
  try {
    await checkSuperAdmin();
    const convex = getConvexClient(convexUrl);
    const data = await convex.query(api.admin.getAllRestaurantsAdmin, {
      adminSecret: getAdminSecret(),
    });

    const client = await clerkClient();
    const enrichedData = await Promise.all(data.map(async (r: any) => {
      try {
        const user = await client.users.getUser(r.ownerId);
        return { ...r, ownerEmail: user.emailAddresses[0]?.emailAddress };
      } catch (e) {
        return { ...r, ownerEmail: "N/A" };
      }
    }));

    return { success: true, data: enrichedData };
  } catch (err: any) {
    console.error("[SuperAdmin Error]", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateRestaurantStatus(
  convexUrl: string,
  restaurantId: string, 
  updates: { 
    approvalStatus?: string; 
    subscriptionStatus?: string; 
    subscriptionEndDate?: number; 
    isOpen?: boolean;
  }
) {
  try {
    await checkSuperAdmin();
    const convex = getConvexClient(convexUrl);
    await convex.mutation(api.admin.updateRestaurantAdmin, {
      adminSecret: getAdminSecret(),
      restaurantId: restaurantId as Id<"restaurants">,
      updates,
    });
    revalidatePath("/admin/superadmin");
    return { success: true };
  } catch (err: any) {
    console.error("[SuperAdmin Error]", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteRestaurant(convexUrl: string, id: string) {
  try {
    await checkSuperAdmin();
    const convex = getConvexClient(convexUrl);
    await convex.mutation(api.admin.deleteRestaurantAdmin, {
      restaurantId: id as Id<"restaurants">,
      adminSecret: getAdminSecret(),
    });
    revalidatePath("/admin/superadmin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateTransferToken(convexUrl: string, id: string) {
  try {
    await checkSuperAdmin();
    const convex = getConvexClient(convexUrl);
    const token = await convex.mutation(api.admin.generateTransferToken, {
      restaurantId: id as Id<"restaurants">,
      adminSecret: getAdminSecret(),
    });
    revalidatePath("/admin/superadmin");
    return { success: true, token };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addSubscriptionDays(convexUrl: string, restaurantId: string, currentEndDate: number | undefined, daysToAdd: number) {
  try {
    await checkSuperAdmin();
    const convex = getConvexClient(convexUrl);
    
    const now = Date.now();
    const baseDate = (!currentEndDate || currentEndDate < now) ? now : currentEndDate;
    const newEndDate = baseDate + daysToAdd * 24 * 60 * 60 * 1000;
    
    await convex.mutation(api.admin.updateRestaurantAdmin, {
      adminSecret: getAdminSecret(),
      restaurantId: restaurantId as Id<"restaurants">,
      updates: {
        subscriptionStatus: "active",
        subscriptionEndDate: newEndDate,
      },
    });
    revalidatePath("/admin/superadmin");
    return { success: true };
  } catch (err: any) {
    console.error("[SuperAdmin Error]", err.message);
    return { success: false, error: err.message };
  }
}
